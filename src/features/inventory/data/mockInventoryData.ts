/**
 * Mock Inventory Data
 * Development only - remove when backend is ready
 */

import { Warehouse, Supplier, Category, StockMovement, InventoryActivity, InventoryAlert, InventoryItem, ProjectStockAllocation } from '../types';

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'w1', warehouseCode: 'WH-001', name: 'Main Warehouse', location: 'Pune MIDC, Maharashtra', manager: 'Rajesh Patil', contactNumber: '+91 98765 43210', capacity: 50000, currentOccupancy: 32000, status: 'Active' },
  { id: 'w2', warehouseCode: 'WH-002', name: 'Fabrication Yard', location: 'Hinjewadi Phase 2, Pune', manager: 'Sunil Kamble', contactNumber: '+91 87654 32109', capacity: 20000, currentOccupancy: 14500, status: 'Active' },
  { id: 'w3', warehouseCode: 'WH-003', name: 'Site Store - Mumbai', location: 'BKC, Mumbai', manager: 'Amit Shah', contactNumber: '+91 76543 21098', capacity: 10000, currentOccupancy: 6800, status: 'Active' },
  { id: 'w4', warehouseCode: 'WH-004', name: 'Regional Store - Nashik', location: 'Satpur, Nashik', manager: 'Vikas More', contactNumber: '+91 65432 10987', capacity: 8000, currentOccupancy: 3200, status: 'Active' },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Tata Steel Ltd', gstNumber: '27AAACT1234A1Z5', contactPerson: 'Anil Mehta', mobile: '+91 98765 11111', email: 'sales@tatasteel.com', address: 'Bombay House', city: 'Mumbai', state: 'Maharashtra', suppliedMaterials: ['Structural Steel', 'Roofing Sheet'], leadTime: 14, status: 'Active' },
  { id: 's2', name: 'JSW Steel', gstNumber: '27AAACJ5678B1Z3', contactPerson: 'Ravi Kumar', mobile: '+91 87654 22222', email: 'supply@jswsteel.com', address: 'Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', suppliedMaterials: ['Primary Steel', 'Secondary Steel'], leadTime: 21, status: 'Active' },
  { id: 's3', name: 'Hindustan Fasteners', gstNumber: '27AABCH9012C1Z1', contactPerson: 'Deepak Joshi', mobile: '+91 76543 33333', email: 'orders@hindfasteners.com', address: 'MIDC Bhosari', city: 'Pune', state: 'Maharashtra', suppliedMaterials: ['Fasteners', 'Hardware'], leadTime: 7, status: 'Active' },
  { id: 's4', name: 'Asian Paints Industrial', gstNumber: '27AABCA3456D1Z2', contactPerson: 'Sneha Reddy', mobile: '+91 65432 44444', email: 'industrial@asianpaints.com', address: 'GIDC Ankleshwar', city: 'Ankleshwar', state: 'Gujarat', suppliedMaterials: ['Paint', 'Coating'], leadTime: 5, status: 'Active' },
  { id: 's5', name: 'Everest Roofing', gstNumber: '27AABCE7890E1Z4', contactPerson: 'Manoj Tiwari', mobile: '+91 54321 55555', email: 'sales@everestroofing.com', address: 'Industrial Area Phase 1', city: 'Noida', state: 'Uttar Pradesh', suppliedMaterials: ['Roofing Sheet', 'Wall Sheet', 'Insulation'], leadTime: 10, status: 'Active' },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Primary Steel', description: 'Main structural steel members', itemCount: 12, status: 'Active' },
  { id: 'c2', name: 'Secondary Steel', description: 'Purlins, girts, secondary members', itemCount: 8, status: 'Active' },
  { id: 'c3', name: 'Roofing Sheet', description: 'Metal roofing sheets and accessories', itemCount: 6, status: 'Active' },
  { id: 'c4', name: 'Wall Sheet', description: 'Wall cladding sheets', itemCount: 4, status: 'Active' },
  { id: 'c5', name: 'Insulation', description: 'Thermal and acoustic insulation', itemCount: 3, status: 'Active' },
  { id: 'c6', name: 'Flashing', description: 'Ridge cap, eave flashing, corner flashing', itemCount: 5, status: 'Active' },
  { id: 'c7', name: 'Fasteners', description: 'Bolts, nuts, screws, anchors', itemCount: 18, status: 'Active' },
  { id: 'c8', name: 'Accessories', description: 'Gutters, downspouts, ventilators', itemCount: 7, status: 'Active' },
  { id: 'c9', name: 'Paint', description: 'Primer, finish coat, epoxy coatings', itemCount: 4, status: 'Active' },
  { id: 'c10', name: 'Hardware', description: 'Door hardware, hinges, locks', itemCount: 9, status: 'Active' },
  { id: 'c11', name: 'Electrical', description: 'Wiring, panels, lighting', itemCount: 6, status: 'Active' },
  { id: 'c12', name: 'Civil Material', description: 'Cement, sand, aggregate, bricks', itemCount: 8, status: 'Active' },
  { id: 'c13', name: 'Fabrication Material', description: 'Welding rods, gas, grinding discs', itemCount: 11, status: 'Active' },
  { id: 'c14', name: 'Finished Goods', description: 'Completed PEB components', itemCount: 3, status: 'Active' },
  { id: 'c15', name: 'Consumables', description: 'Safety equipment, tools, PPE', itemCount: 14, status: 'Active' },
  { id: 'c16', name: 'Other', description: 'Miscellaneous items', itemCount: 2, status: 'Active' },
];

export const MOCK_ITEMS: InventoryItem[] = [
  {
    id: '1', itemCode: 'INV-0001', itemMasterId: 'IM-001', itemName: 'ISMB 300 Steel Beam', unit: 'Kg',
    currentStock: 8500, reservedStock: 2000, issuedStock: 1500, availableStock: 5000, totalValue: 552500,
    minimumStock: 5000, reorderLevel: 2000, reorderQuantity: 3000, safetyStock: 1000,
    warehouseId: 'w1', warehouseName: 'Main Warehouse', binLocation: 'A-12-03',
    category: 'Structural Steel', brand: 'JSW Steel', itemTypeClass: 'Structural',
    incomingStock: 2000, outgoingStock: 500, purchaseRate: 65,
    status: 'In Stock', lastUpdated: new Date('2024-06-10'), lastMovementDate: new Date('2024-06-10'),
    customFields: { storageCondition: 'Outdoor', handlingNotes: 'Use forklift for beams' },
  },
  {
    id: '2', itemCode: 'INV-0002', itemMasterId: 'IM-002', itemName: 'ISMB 200 Steel Beam', unit: 'Kg',
    currentStock: 4200, reservedStock: 1500, issuedStock: 800, availableStock: 1900, totalValue: 260400,
    minimumStock: 3000, reorderLevel: 1500, reorderQuantity: 2000, safetyStock: 500,
    warehouseId: 'w1', warehouseName: 'Main Warehouse', binLocation: 'A-12-04',
    category: 'Structural Steel', brand: 'TATA Steel', itemTypeClass: 'Structural',
    incomingStock: 0, outgoingStock: 300, purchaseRate: 62,
    status: 'In Stock', lastUpdated: new Date('2024-06-08'), lastMovementDate: new Date('2024-06-08'),
  },
  {
    id: '3', itemCode: 'INV-0003', itemMasterId: 'IM-003', itemName: 'Z-Purlin 200x75x20x2mm', unit: 'Meter',
    currentStock: 320, reservedStock: 100, issuedStock: 200, availableStock: 20, totalValue: 30400,
    minimumStock: 500, reorderLevel: 200, reorderQuantity: 400, safetyStock: 100,
    warehouseId: 'w2', warehouseName: 'Fabrication Yard', binLocation: 'B-05-01',
    category: 'Secondary Steel', brand: 'JSW Steel', itemTypeClass: 'Structural',
    incomingStock: 150, outgoingStock: 0, purchaseRate: 95,
    status: 'Low Stock', lastUpdated: new Date('2024-06-12'), lastMovementDate: new Date('2024-06-12'),
  },
  {
    id: '4', itemCode: 'INV-0004', itemMasterId: 'IM-004', itemName: 'Trapezoidal Roof Sheet 0.5mm', unit: 'SqMeter',
    currentStock: 450, reservedStock: 150, issuedStock: 100, availableStock: 200, totalValue: 144000,
    minimumStock: 200, reorderLevel: 100, reorderQuantity: 300, safetyStock: 50,
    warehouseId: 'w1', warehouseName: 'Main Warehouse', binLocation: 'C-01-02',
    category: 'Roofing Sheet', brand: 'Tata Bluescope', itemTypeClass: 'Cladding',
    incomingStock: 0, outgoingStock: 100, purchaseRate: 320,
    status: 'In Stock', lastUpdated: new Date('2024-06-11'), lastMovementDate: new Date('2024-06-11'),
  },
  {
    id: '5', itemCode: 'INV-0005', itemMasterId: 'IM-005', itemName: 'High Strength Bolt M20x70 (8.8)', unit: 'Nos',
    currentStock: 0, reservedStock: 0, issuedStock: 0, availableStock: 0, totalValue: 0,
    minimumStock: 500, reorderLevel: 200, reorderQuantity: 1000, safetyStock: 100,
    warehouseId: 'w2', warehouseName: 'Fabrication Yard', binLocation: 'D-08-01',
    category: 'Fasteners', brand: 'Unbrako', itemTypeClass: 'Accessory',
    incomingStock: 500, outgoingStock: 0, purchaseRate: 45,
    status: 'Out of Stock', lastUpdated: new Date('2024-06-05'), lastMovementDate: new Date('2024-06-05'),
  },
  {
    id: '6', itemCode: 'INV-0006', itemMasterId: 'IM-006', itemName: 'Anchor Bolt M24x600', unit: 'Nos',
    currentStock: 45, reservedStock: 30, issuedStock: 15, availableStock: 0, totalValue: 8100,
    minimumStock: 100, reorderLevel: 50, reorderQuantity: 200, safetyStock: 25,
    warehouseId: 'w1', warehouseName: 'Main Warehouse', binLocation: 'D-08-02',
    category: 'Fasteners', brand: 'Unbrako', itemTypeClass: 'Accessory',
    incomingStock: 0, outgoingStock: 30, purchaseRate: 180,
    status: 'Low Stock', lastUpdated: new Date('2024-06-09'), lastMovementDate: new Date('2024-06-09'),
  },
  {
    id: '7', itemCode: 'INV-0007', itemMasterId: 'IM-007', itemName: 'Red Oxide Primer 20L', unit: 'Liter',
    currentStock: 120, reservedStock: 0, issuedStock: 50, availableStock: 70, totalValue: 33600,
    minimumStock: 50, reorderLevel: 20, reorderQuantity: 50, safetyStock: 10,
    warehouseId: 'w2', warehouseName: 'Fabrication Yard', binLocation: 'E-02-01',
    category: 'Paint', brand: 'Asian Paints', itemTypeClass: 'Accessory',
    incomingStock: 0, outgoingStock: 20, purchaseRate: 280,
    status: 'In Stock', lastUpdated: new Date('2024-06-07'), lastMovementDate: new Date('2024-06-07'),
  },
  {
    id: '8', itemCode: 'INV-0008', itemMasterId: 'IM-008', itemName: 'Glass Wool Insulation 50mm', unit: 'SqMeter',
    currentStock: 15, reservedStock: 10, issuedStock: 5, availableStock: 0, totalValue: 2700,
    minimumStock: 100, reorderLevel: 50, reorderQuantity: 150, safetyStock: 25,
    warehouseId: 'w1', warehouseName: 'Main Warehouse', binLocation: 'F-03-01',
    category: 'Insulation', brand: 'Knauf', itemTypeClass: 'Cladding',
    incomingStock: 0, outgoingStock: 0, purchaseRate: 180,
    status: 'Critical', lastUpdated: new Date('2024-06-13'), lastMovementDate: new Date('2024-06-13'),
  },
  {
    id: '9', itemCode: 'INV-0009', itemMasterId: 'IM-009', itemName: 'C-Channel 150x75x20x3mm', unit: 'Meter',
    currentStock: 280, reservedStock: 80, issuedStock: 150, availableStock: 50, totalValue: 30800,
    minimumStock: 300, reorderLevel: 150, reorderQuantity: 250, safetyStock: 50,
    warehouseId: 'w2', warehouseName: 'Fabrication Yard', binLocation: 'B-05-02',
    category: 'Secondary Steel', brand: 'JSW Steel', itemTypeClass: 'Structural',
    incomingStock: 100, outgoingStock: 20, purchaseRate: 110,
    status: 'Low Stock', lastUpdated: new Date('2024-06-10'), lastMovementDate: new Date('2024-06-10'),
  },
  {
    id: '10', itemCode: 'INV-0010', itemMasterId: 'IM-010', itemName: 'Wall Cladding Sheet 0.45mm', unit: 'SqMeter',
    currentStock: 0, reservedStock: 0, issuedStock: 0, availableStock: 0, totalValue: 0,
    minimumStock: 150, reorderLevel: 75, reorderQuantity: 200, safetyStock: 30,
    warehouseId: 'w1', warehouseName: 'Main Warehouse', binLocation: 'C-01-03',
    category: 'Wall Sheet', brand: 'Everest', itemTypeClass: 'Cladding',
    incomingStock: 200, outgoingStock: 0, purchaseRate: 290,
    status: 'Out of Stock', lastUpdated: new Date('2024-06-01'), lastMovementDate: new Date('2024-06-01'),
  },
  {
    id: '11', itemCode: 'INV-0011', itemMasterId: 'IM-011', itemName: 'Welding Rod E7018 3.15mm', unit: 'Kg',
    currentStock: 250, reservedStock: 50, issuedStock: 100, availableStock: 100, totalValue: 30000,
    minimumStock: 100, reorderLevel: 50, reorderQuantity: 150, safetyStock: 20,
    warehouseId: 'w2', warehouseName: 'Fabrication Yard', binLocation: 'E-04-01',
    category: 'Fabrication Material', brand: 'Ador', itemTypeClass: 'Accessory',
    incomingStock: 100, outgoingStock: 0, purchaseRate: 120,
    status: 'In Stock', lastUpdated: new Date('2024-06-12'), lastMovementDate: new Date('2024-06-12'),
  },
  {
    id: '12', itemCode: 'INV-0012', itemMasterId: 'IM-012', itemName: 'Turbo Ventilator 24 inch', unit: 'Nos',
    currentStock: 8, reservedStock: 4, issuedStock: 2, availableStock: 2, totalValue: 28000,
    minimumStock: 10, reorderLevel: 5, reorderQuantity: 10, safetyStock: 2,
    warehouseId: 'w3', warehouseName: 'Site Store - Mumbai', binLocation: 'G-01-01',
    category: 'Ventilation', brand: 'Alfa', itemTypeClass: 'Accessory',
    incomingStock: 0, outgoingStock: 2, purchaseRate: 3500,
    status: 'Low Stock', lastUpdated: new Date('2024-06-11'), lastMovementDate: new Date('2024-06-11'),
    customFields: { storageCondition: 'Indoor' },
  },
];

export const MOCK_MOVEMENTS: StockMovement[] = [
  { id: 'm1', movementNumber: 'SM-0001', itemId: '1', itemName: 'ISMB 300 Steel Beam', type: 'Stock In', quantity: 5000, warehouseId: 'w1', warehouse: 'Main Warehouse', referenceNumber: 'PO-2024-045', referenceType: 'Purchase Order', performedBy: 'Rajesh Patil', remarks: 'Received from JSW Steel', date: new Date('2024-06-10') },
  { id: 'm2', movementNumber: 'SM-0002', itemId: '4', itemName: 'Trapezoidal Roof Sheet 0.5mm', type: 'Stock Out', quantity: 100, warehouseId: 'w1', warehouse: 'Main Warehouse', referenceNumber: 'PRJ-2024-008', referenceType: 'Project', performedBy: 'Amit Shah', remarks: 'Issued for Warehouse project', date: new Date('2024-06-11') },
  { id: 'm3', movementNumber: 'SM-0003', itemId: '3', itemName: 'Z-Purlin 200x75x20x2mm', type: 'Reservation', quantity: 100, warehouseId: 'w2', warehouse: 'Fabrication Yard', referenceNumber: 'PRJ-2024-012', referenceType: 'Project', performedBy: 'Sunil Kamble', remarks: 'Reserved for Factory Shed', date: new Date('2024-06-12') },
  { id: 'm4', movementNumber: 'SM-0004', itemId: '7', itemName: 'Red Oxide Primer 20L', type: 'Consumption', quantity: 20, warehouseId: 'w2', warehouse: 'Fabrication Yard', referenceNumber: 'FAB-045', referenceType: 'Fabrication', performedBy: 'Sunil Kamble', remarks: 'Used for beam painting', date: new Date('2024-06-07') },
  { id: 'm5', movementNumber: 'SM-0005', itemId: '1', itemName: 'ISMB 300 Steel Beam', type: 'Transfer', quantity: 1500, warehouseId: 'w2', warehouse: 'Fabrication Yard', referenceNumber: 'TR-012', referenceType: 'Transfer', performedBy: 'Rajesh Patil', remarks: 'Transferred to fabrication yard', date: new Date('2024-06-09') },
  { id: 'm6', movementNumber: 'SM-0006', itemId: '11', itemName: 'Welding Rod E7018 3.15mm', type: 'Stock In', quantity: 100, warehouseId: 'w2', warehouse: 'Fabrication Yard', referenceNumber: 'PO-2024-052', referenceType: 'Purchase Order', performedBy: 'Sunil Kamble', date: new Date('2024-06-12') },
  { id: 'm7', movementNumber: 'SM-0007', itemId: '9', itemName: 'C-Channel 150x75x20x3mm', type: 'Adjustment', quantity: -20, warehouseId: 'w2', warehouse: 'Fabrication Yard', referenceNumber: 'ADJ-005', referenceType: 'Adjustment', performedBy: 'Sunil Kamble', remarks: 'Physical count correction', date: new Date('2024-06-10') },
  { id: 'm8', movementNumber: 'SM-0008', itemId: '6', itemName: 'Anchor Bolt M24x600', type: 'Stock Out', quantity: 30, warehouseId: 'w1', warehouse: 'Main Warehouse', referenceNumber: 'PRJ-2024-008', referenceType: 'Project', performedBy: 'Amit Shah', remarks: 'Foundation bolts for site', date: new Date('2024-06-09') },
];

export const MOCK_ACTIVITIES: InventoryActivity[] = [
  { id: 'a1', itemId: '1', type: 'item_created', description: 'Item ISMB 300 Steel Beam created', performedBy: 'Vikram Singh', performedAt: new Date('2024-01-15T10:00:00') },
  { id: 'a2', itemId: '1', type: 'stock_in', description: 'Stock In: 5000 Kg received from JSW Steel', performedBy: 'Rajesh Patil', performedAt: new Date('2024-06-10T09:30:00') },
  { id: 'a3', itemId: '1', type: 'transfer', description: '1500 Kg transferred to Fabrication Yard', performedBy: 'Rajesh Patil', performedAt: new Date('2024-06-09T14:00:00') },
  { id: 'a4', itemId: '1', type: 'stock_out', description: '2000 Kg reserved for PRJ-2024-008', performedBy: 'Amit Shah', performedAt: new Date('2024-06-08T11:00:00') },
  { id: 'a5', itemId: '5', type: 'reorder_triggered', description: 'High Strength Bolt M20x70 below minimum stock - reorder required', performedBy: 'System', performedAt: new Date('2024-06-05T08:00:00') },
  { id: 'a6', itemId: '8', type: 'status_changed', description: 'Status changed to Critical - stock at 15 SqMeter', performedBy: 'System', performedAt: new Date('2024-06-13T06:00:00') },
];

export const MOCK_ALERTS: InventoryAlert[] = [
  { id: 'al1', itemId: '5', itemName: 'High Strength Bolt M20x70 (8.8)', itemCode: 'INV-0005', type: 'Out of Stock', currentStock: 0, threshold: 500, severity: 'critical', createdAt: new Date('2024-06-05') },
  { id: 'al2', itemId: '10', itemName: 'Wall Cladding Sheet 0.45mm', itemCode: 'INV-0010', type: 'Out of Stock', currentStock: 0, threshold: 150, severity: 'critical', createdAt: new Date('2024-06-01') },
  { id: 'al3', itemId: '8', itemName: 'Glass Wool Insulation 50mm', itemCode: 'INV-0008', type: 'Critical Stock', currentStock: 15, threshold: 100, severity: 'critical', createdAt: new Date('2024-06-13') },
  { id: 'al4', itemId: '3', itemName: 'Z-Purlin 200x75x20x2mm', itemCode: 'INV-0003', type: 'Low Stock', currentStock: 320, threshold: 500, severity: 'warning', createdAt: new Date('2024-06-12') },
  { id: 'al5', itemId: '6', itemName: 'Anchor Bolt M24x600', itemCode: 'INV-0006', type: 'Low Stock', currentStock: 45, threshold: 100, severity: 'warning', createdAt: new Date('2024-06-09') },
  { id: 'al6', itemId: '9', itemName: 'C-Channel 150x75x20x3mm', itemCode: 'INV-0009', type: 'Low Stock', currentStock: 280, threshold: 300, severity: 'warning', createdAt: new Date('2024-06-10') },
  { id: 'al7', itemId: '12', itemName: 'Turbo Ventilator 24 inch', itemCode: 'INV-0012', type: 'Reorder Required', currentStock: 8, threshold: 10, severity: 'warning', createdAt: new Date('2024-06-11') },
];

export const MOCK_PROJECT_ALLOCATIONS: ProjectStockAllocation[] = [
  {
    projectId: 'PRJ-001',
    projectNumber: 'PRJ-2024-001',
    projectName: 'Factory Shed - Ahmedabad',
    customerName: 'Reliance Industries',
    reservedQuantity: 2500,
    issuedQuantity: 1500,
    balanceQuantity: 1000,
    status: 'Active',
  },
  {
    projectId: 'PRJ-002',
    projectNumber: 'PRJ-2024-002',
    projectName: 'Warehouse - Mumbai',
    customerName: 'Tata Motors',
    reservedQuantity: 1500,
    issuedQuantity: 800,
    balanceQuantity: 700,
    status: 'Active',
  },
  {
    projectId: 'PRJ-003',
    projectNumber: 'PRJ-2024-003',
    projectName: 'Industrial Building - Pune',
    customerName: 'Mahindra & Mahindra',
    reservedQuantity: 1000,
    issuedQuantity: 1000,
    balanceQuantity: 0,
    status: 'Completed',
  },
];
