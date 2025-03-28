export interface Office {
  id: string;
  name: string;
  address: string;
  payRate: number; // Pay rate per day in dollars
  description?: string;
}

// Sample office data
const offices: Office[] = [
  {
    id: '1',
    name: 'Downtown Office',
    address: '123 Main St, Downtown',
    payRate: 150,
    description: 'Main downtown office building'
  },
  {
    id: '2',
    name: 'Westside Branch',
    address: '456 West Ave, Westside',
    payRate: 125,
    description: 'Branch office in western district'
  },
  {
    id: '3',
    name: 'Eastside Branch',
    address: '789 East Blvd, Eastside',
    payRate: 135,
    description: 'Branch office in eastern district'
  },
  {
    id: '4',
    name: 'Southside Branch',
    address: '101 South St, Southside',
    payRate: 145,
    description: 'Branch office in southern district'
  },
  {
    id: '5',
    name: 'Northside Branch',
    address: '202 North Ave, Northside',
    payRate: 140,
    description: 'Branch office in northern district'
  }
];

export default offices;
