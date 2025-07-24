// Centralized squad data for all official squads

const squads = [
  {
    id: 'alpha',
    name: 'Squad Alpha',
    zone: 'downtown',
    members: [
      { id: 1, name: 'Officer John Smith', phone: '+1-555-0101', email: 'john.smith@city.gov', status: 'available', location: 'Main Station' },
      { id: 2, name: 'Officer Sarah Johnson', phone: '+1-555-0102', email: 'sarah.johnson@city.gov', status: 'busy', location: 'Downtown Patrol' },
      { id: 3, name: 'Officer Mike Chen', phone: '+1-555-0103', email: 'mike.chen@city.gov', status: 'available', location: 'City Center' },
      { id: 4, name: 'Officer Lisa Davis', phone: '+1-555-0104', email: 'lisa.davis@city.gov', status: 'off-duty', location: 'Off Duty' }
    ],
    vehicle: 'Alpha-001',
    supervisor: 'Captain Robert Wilson',
    status: 'active',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    coverage: 'downtown, financial district, city center'
  },
  {
    id: 'beta',
    name: 'Squad Beta',
    zone: 'residential',
    members: [
      { id: 5, name: 'Officer Maria Garcia', phone: '+1-555-0105', email: 'maria.garcia@city.gov', status: 'available', location: 'North Station' },
      { id: 6, name: 'Officer David Kim', phone: '+1-555-0106', email: 'david.kim@city.gov', status: 'busy', location: 'Residential Patrol' },
      { id: 7, name: 'Officer Emily Brown', phone: '+1-555-0107', email: 'emily.brown@city.gov', status: 'available', location: 'Suburban Area' }
    ],
    vehicle: 'Beta-002',
    supervisor: 'Lieutenant Maria Garcia',
    status: 'active',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    coverage: 'residential areas, suburbs, parks'
  },
  {
    id: 'gamma',
    name: 'Squad Gamma',
    zone: 'commercial',
    members: [
      { id: 8, name: 'Officer James Wilson', phone: '+1-555-0108', email: 'james.wilson@city.gov', status: 'available', location: 'Commercial Station' },
      { id: 9, name: 'Officer Rachel Green', phone: '+1-555-0109', email: 'rachel.green@city.gov', status: 'busy', location: 'Shopping District' },
      { id: 10, name: 'Officer Tom Anderson', phone: '+1-555-0110', email: 'tom.anderson@city.gov', status: 'available', location: 'Business District' },
      { id: 11, name: 'Officer Jessica Lee', phone: '+1-555-0111', email: 'jessica.lee@city.gov', status: 'off-duty', location: 'Off Duty' }
    ],
    vehicle: 'Gamma-003',
    supervisor: 'Sergeant David Kim',
    status: 'active',
    coordinates: { lat: 40.7505, lng: -73.9934 },
    coverage: 'commercial districts, shopping centers, business areas'
  },
  {
    id: 'delta',
    name: 'Squad Delta',
    zone: 'industrial',
    members: [
      { id: 12, name: 'Officer Alex Rodriguez', phone: '+1-555-0112', email: 'alex.rodriguez@city.gov', status: 'available', location: 'Industrial Station' },
      { id: 13, name: 'Officer Samantha White', phone: '+1-555-0113', email: 'samantha.white@city.gov', status: 'standby', location: 'Factory District' },
      { id: 14, name: 'Officer Kevin Martinez', phone: '+1-555-0114', email: 'kevin.martinez@city.gov', status: 'available', location: 'Warehouse Area' }
    ],
    vehicle: 'Delta-004',
    supervisor: 'Officer Sarah Johnson',
    status: 'standby',
    coordinates: { lat: 40.7421, lng: -73.9911 },
    coverage: 'industrial zones, factories, warehouses'
  }
];

export default squads; 