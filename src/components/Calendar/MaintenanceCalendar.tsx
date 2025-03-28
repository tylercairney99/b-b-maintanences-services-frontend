import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';
import offices, { Office } from '../../data/officesData';

// Set up the localizer for big calendar
const localizer = momentLocalizer(moment);

interface MaintenanceEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  officeIds: string[];
  totalPayRate: number;
}

interface OfficeAssignment {
  officeId: string;
  date: Date;
}

const MaintenanceCalendar: React.FC = () => {
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showWeeklySummary, setShowWeeklySummary] = useState<boolean>(false);
  
  // Find events for a specific date
  const findEventsForDate = (date: Date): MaintenanceEvent | undefined => {
    const dateStr = moment(date).format('YYYY-MM-DD');
    return events.find(event => 
      moment(event.start).format('YYYY-MM-DD') === dateStr
    );
  };
  
  // Calculate weekly totals
  const calculateWeeklyTotals = useCallback(() => {
    if (!events.length) return [];
    
    const weeks: { [key: string]: { week: string, totalPay: number, events: MaintenanceEvent[] } } = {};
    
    events.forEach(event => {
      const weekStart = moment(event.start).startOf('week').format('YYYY-MM-DD');
      
      if (!weeks[weekStart]) {
        weeks[weekStart] = {
          week: `Week of ${moment(weekStart).format('MMM D, YYYY')}`,
          totalPay: 0,
          events: []
        };
      }
      
      weeks[weekStart].totalPay += event.totalPayRate;
      weeks[weekStart].events.push(event);
    });
    
    return Object.values(weeks).sort((a, b) => 
      moment(a.week.split('Week of ')[1]).valueOf() - 
      moment(b.week.split('Week of ')[1]).valueOf()
    );
  }, [events]);
  
  const weeklyTotals = useMemo(() => calculateWeeklyTotals(), [calculateWeeklyTotals]);
  
  // Handle selecting a slot (day) on the calendar
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
  };
  
  // Add/update an office assignment to a date
  const handleAddOffice = () => {
    if (!selectedOffice || !selectedDate) return;
    
    const newOffice = offices.find(office => office.id === selectedOffice);
    if (!newOffice) return;
    
    const existingEvent = findEventsForDate(selectedDate);
    const dateStr = moment(selectedDate).format('MMM D, YYYY');
    
    if (existingEvent) {
      // If event exists and office not already assigned
      if (!existingEvent.officeIds.includes(selectedOffice)) {
        const updatedEvents = events.map(event => {
          if (event.id === existingEvent.id) {
            const updatedOfficeIds = [...event.officeIds, selectedOffice];
            const totalPayRate = calculateTotalPayRate(updatedOfficeIds);
            
            return {
              ...event,
              officeIds: updatedOfficeIds,
              totalPayRate,
              title: `Maintenance: ${updatedOfficeIds.length} offices - $${totalPayRate}`
            };
          }
          return event;
        });
        
        setEvents(updatedEvents);
      }
    } else {
      // Create new event
      const newEvent: MaintenanceEvent = {
        id: `event-${Date.now()}`,
        title: `Maintenance: 1 office - $${newOffice.payRate}`,
        start: selectedDate,
        end: selectedDate,
        allDay: true,
        officeIds: [selectedOffice],
        totalPayRate: newOffice.payRate
      };
      
      setEvents([...events, newEvent]);
    }
    
    // Reset selection
    setSelectedOffice('');
  };
  
  // Calculate the total pay rate for a set of office IDs
  const calculateTotalPayRate = (officeIds: string[]): number => {
    return officeIds.reduce((total, id) => {
      const office = offices.find(o => o.id === id);
      return total + (office?.payRate || 0);
    }, 0);
  };
  
  // Get the list of offices assigned to an event
  const getAssignedOffices = (event: MaintenanceEvent): Office[] => {
    return offices.filter(office => event.officeIds.includes(office.id));
  };
  
  // Handle clicking on an event
  const handleSelectEvent = (event: MaintenanceEvent) => {
    setSelectedDate(event.start);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Maintenance Schedule & Payment Tracker</h1>
        <button 
          className="toggle-summary-btn"
          onClick={() => setShowWeeklySummary(!showWeeklySummary)}
        >
          {showWeeklySummary ? 'Hide Weekly Summary' : 'Show Weekly Summary'}
        </button>
      </div>
      
      <div className="calendar-layout">
        <div className={`calendar-wrapper ${showWeeklySummary ? 'with-summary' : ''}`}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 650 }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            views={['month', 'week']}
            defaultView={Views.MONTH}
          />
        </div>
        
        {showWeeklySummary && (
          <div className="weekly-summary">
            <h2>Weekly Pay Summary</h2>
            {weeklyTotals.length === 0 ? (
              <p>No events scheduled yet.</p>
            ) : (
              <div className="weekly-totals">
                {weeklyTotals.map((week, index) => (
                  <div key={index} className="weekly-total-item">
                    <h3>{week.week}</h3>
                    <p className="weekly-amount">${week.totalPay.toFixed(2)}</p>
                    <ul className="weekly-events">
                      {week.events.map(event => (
                        <li key={event.id}>
                          {moment(event.start).format('ddd, MMM D')}: ${event.totalPayRate.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="calendar-actions">
        <div className="action-panel">
          <h2>
            {selectedDate ? `Add Office for ${moment(selectedDate).format('MMM D, YYYY')}` : 'Select a date on the calendar'}
          </h2>
          
          {selectedDate && (
            <div className="office-assignment">
              <div className="office-selector">
                <label htmlFor="office-select">Select Office:</label>
                <select 
                  id="office-select"
                  value={selectedOffice}
                  onChange={(e) => setSelectedOffice(e.target.value)}
                >
                  <option value="">-- Select an office --</option>
                  {offices.map(office => (
                    <option key={office.id} value={office.id}>
                      {office.name} - ${office.payRate}/day
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                className="add-office-btn"
                onClick={handleAddOffice}
                disabled={!selectedOffice}
              >
                Add Office to Date
              </button>
            </div>
          )}
          
          {selectedDate && findEventsForDate(selectedDate) && (
            <div className="assigned-offices">
              <h3>Assigned Offices:</h3>
              <ul>
                {getAssignedOffices(findEventsForDate(selectedDate)!).map(office => (
                  <li key={office.id}>
                    <strong>{office.name}</strong> - ${office.payRate}/day
                    <p className="office-address">{office.address}</p>
                  </li>
                ))}
              </ul>
              <p className="daily-total">
                <strong>Total for day: ${findEventsForDate(selectedDate)!.totalPayRate.toFixed(2)}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar; 