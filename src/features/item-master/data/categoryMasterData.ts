/**
 * PEB Item Master Category Data
 * Complete hierarchical structure with 60 categories, 85+ subcategories, and 400+ items
 */

export interface CategoryNode {
  id: string;
  name: string;
  code: string;
  level: number; // 1 = main category, 2 = subcategory, 3 = item type
  categoryType: 'PRODUCT' | 'PROCESS' | 'SPECIALIZED';
  description?: string;
  icon?: string;
  children?: CategoryNode[];
  items?: string[];
}

export const categoryMasterData: CategoryNode[] = [
  {
    id: 'cat-1',
    name: 'Fasteners & Fixing Accessories',
    code: 'FASTENERS',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Wrench',
    children: [
      {
        id: 'cat-1-1',
        name: 'Anchor Fasteners',
        code: 'FAST-ANCHOR',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-1-1-1',
            name: 'Anchor Bolts',
            code: 'FAST-ANCHOR-BOLT',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Anchor bolts', 'Cast-in anchor bolts', 'Template bolts', 'Chemical anchors', 'Expansion anchors', 'Sleeve anchors', 'Foundation bolts', 'J bolts', 'L bolts', 'U bolts']
          },
          {
            id: 'cat-1-1-2',
            name: 'Anchor Components',
            code: 'FAST-ANCHOR-COMP',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Nuts', 'Lock nuts', 'Double nuts', 'Flat washers', 'Spring washers', 'Plate washers', 'Leveling nuts']
          }
        ]
      },
      {
        id: 'cat-1-2',
        name: 'Structural Bolts',
        code: 'FAST-STRUCT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-1-2-1',
            name: 'HSFG Bolts',
            code: 'FAST-HSFG',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['M12', 'M16', 'M20', 'M24', 'M30']
          },
          {
            id: 'cat-1-2-2',
            name: 'Structural Bolts',
            code: 'FAST-STRUCT-BOLT',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Hex bolts', 'Friction grip bolts', 'Bearing bolts']
          },
          {
            id: 'cat-1-2-3',
            name: 'Structural Bolt Accessories',
            code: 'FAST-STRUCT-ACC',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Plain washers', 'Hardened washers', 'Spring washers', 'Lock washers']
          }
        ]
      },
      {
        id: 'cat-1-3',
        name: 'Roofing Fasteners',
        code: 'FAST-ROOF',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-1-3-1',
            name: 'Self Drilling Screws',
            code: 'FAST-ROOF-SDS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['SDS 10-16', 'SDS 12-14', 'SDS carbon steel', 'SDS stainless steel']
          },
          {
            id: 'cat-1-3-2',
            name: 'Stitch Screws',
            code: 'FAST-ROOF-STITCH',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Lap stitch screws', 'Side lap screws']
          },
          {
            id: 'cat-1-3-3',
            name: 'Roofing Fastener Accessories',
            code: 'FAST-ROOF-ACC',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['EPDM washer', 'Neoprene washer', 'Aluminium washer', 'Dome cap']
          }
        ]
      },
      {
        id: 'cat-1-4',
        name: 'Rivets',
        code: 'FAST-RIVET',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-1-4-1',
            name: 'Blind Rivets',
            code: 'FAST-RIVET-BLIND',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Aluminium rivets', 'Steel rivets', 'SS rivets']
          },
          {
            id: 'cat-1-4-2',
            name: 'Structural Rivets',
            code: 'FAST-RIVET-STRUCT',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['High strength rivets', 'Pop rivets']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Connection Accessories',
    code: 'CONNECTION',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Link',
    children: [
      {
        id: 'cat-2-1',
        name: 'Plates',
        code: 'CONN-PLATE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-2-1-1',
            name: 'Structural Plates',
            code: 'CONN-PLATE-STRUCT',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Base plates', 'End plates', 'Gusset plates', 'Cleat plates', 'Connection plates', 'Seat plates', 'Web plates', 'Flange plates', 'Splice plates']
          },
          {
            id: 'cat-2-1-2',
            name: 'Special Plates',
            code: 'CONN-PLATE-SPECIAL',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Crane bracket plates', 'Mezzanine plates', 'Stiffener plates']
          }
        ]
      },
      {
        id: 'cat-2-2',
        name: 'Shimming Materials',
        code: 'CONN-SHIM',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-2-2-1',
            name: 'Shims',
            code: 'CONN-SHIM-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Shim plates', 'Leveling shims', 'Packing plates', 'Spacer plates']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-3',
    name: 'Primary Frame Accessories',
    code: 'PRIMARY',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Building2',
    children: [
      {
        id: 'cat-3-1',
        name: 'Main Frame Members',
        code: 'PRIMARY-FRAME',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-3-1-1',
            name: 'Columns',
            code: 'PRIMARY-COL',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['End columns', 'Interior columns', 'Crane columns', 'Lean-to columns']
          },
          {
            id: 'cat-3-1-2',
            name: 'Rafters',
            code: 'PRIMARY-RAFT',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Tapered rafters', 'End rafters', 'Multi-span rafters']
          },
          {
            id: 'cat-3-1-3',
            name: 'Special Frames',
            code: 'PRIMARY-SPECIAL',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Portal frames', 'Multi-gable frames', 'Monitor roof frames']
          }
        ]
      },
      {
        id: 'cat-3-2',
        name: 'Reinforcement Accessories',
        code: 'PRIMARY-REINF',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-3-2-1',
            name: 'Stiffeners',
            code: 'PRIMARY-STIFF',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Web stiffeners', 'Flange stiffeners', 'Bearing stiffeners', 'Doubler plates', 'Haunch plates']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-4',
    name: 'Bracing System Accessories',
    code: 'BRACING',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Shield',
    children: [
      {
        id: 'cat-4-1',
        name: 'Roof Bracing',
        code: 'BRACE-ROOF',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-4-1-1',
            name: 'Roof Bracing Types',
            code: 'BRACE-ROOF-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Rod bracing', 'Cable bracing', 'Angle bracing', 'Pipe bracing']
          },
          {
            id: 'cat-4-1-2',
            name: 'Roof Bracing Accessories',
            code: 'BRACE-ROOF-ACC',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Turnbuckles', 'Eye bolts', 'Clevis', 'Shackles']
          }
        ]
      },
      {
        id: 'cat-4-2',
        name: 'Wall Bracing',
        code: 'BRACE-WALL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-4-2-1',
            name: 'Wall Bracing Types',
            code: 'BRACE-WALL-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Cross bracing', 'Wind bracing', 'Portal bracing']
          },
          {
            id: 'cat-4-2-2',
            name: 'Wall Bracing Accessories',
            code: 'BRACE-WALL-ACC',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Connection plates', 'Tension rods', 'Adjustable rods']
          }
        ]
      },
      {
        id: 'cat-4-3',
        name: 'Knee Bracing',
        code: 'BRACE-KNEE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-4-3-1',
            name: 'Knee Brace Types',
            code: 'BRACE-KNEE-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Angle knee brace', 'Pipe knee brace', 'Tube knee brace']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-5',
    name: 'Secondary Structure Accessories',
    code: 'SECONDARY',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Layers',
    children: [
      {
        id: 'cat-5-1',
        name: 'Roof Purlins',
        code: 'SEC-PURLIN',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-5-1-1',
            name: 'Z Purlins',
            code: 'SEC-PURLIN-Z',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Z150', 'Z200', 'Z250', 'Z300']
          },
          {
            id: 'cat-5-1-2',
            name: 'C Purlins',
            code: 'SEC-PURLIN-C',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['C150', 'C200', 'C250', 'C300']
          },
          {
            id: 'cat-5-1-3',
            name: 'Purlin Accessories',
            code: 'SEC-PURLIN-ACC',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Cleats', 'Purlin bolts', 'Spacer sleeves']
          }
        ]
      },
      {
        id: 'cat-5-2',
        name: 'Wall Girts',
        code: 'SEC-GIRT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-5-2-1',
            name: 'Girt Types',
            code: 'SEC-GIRT-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['C Girts', 'Z Girts', 'Flush girts', 'Bypass girts']
          },
          {
            id: 'cat-5-2-2',
            name: 'Girt Accessories',
            code: 'SEC-GIRT-ACC',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Girt cleats', 'Girt brackets', 'Spacer plates']
          }
        ]
      },
      {
        id: 'cat-5-3',
        name: 'Eave Members',
        code: 'SEC-EAVE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-5-3-1',
            name: 'Eave Components',
            code: 'SEC-EAVE-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Eave struts', 'Eave channels', 'Eave beams']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-6',
    name: 'Sag System Accessories',
    code: 'SAG',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Zap',
    children: [
      {
        id: 'cat-6-1',
        name: 'Sag Rods',
        code: 'SAG-ROD',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-6-1-1',
            name: 'Sag Rod Types',
            code: 'SAG-ROD-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Threaded rods', 'Pipe sag rods', 'Adjustable rods']
          },
          {
            id: 'cat-6-1-2',
            name: 'Sag Rod Components',
            code: 'SAG-ROD-COMP',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Couplers', 'Nuts', 'Washers', 'Turnbuckles']
          }
        ]
      },
      {
        id: 'cat-6-2',
        name: 'Fly Bracing',
        code: 'SAG-FLY',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-6-2-1',
            name: 'Fly Brace Components',
            code: 'SAG-FLY-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Fly braces', 'Fly brace clips', 'Fly brace bolts']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-7',
    name: 'Roofing Accessories',
    code: 'ROOFING',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Home',
    children: [
      {
        id: 'cat-7-1',
        name: 'Roof Sheets',
        code: 'ROOF-SHEET',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-7-1-1',
            name: 'Single Skin',
            code: 'ROOF-SHEET-SINGLE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['GI sheets', 'Galvalume sheets', 'Color coated sheets']
          },
          {
            id: 'cat-7-1-2',
            name: 'Premium Systems',
            code: 'ROOF-SHEET-PREMIUM',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Standing seam roofing', 'Clip lock roofing']
          },
          {
            id: 'cat-7-1-3',
            name: 'Insulated Roofing',
            code: 'ROOF-SHEET-INSUL',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Sandwich panels', 'PUF roof panels']
          }
        ]
      },
      {
        id: 'cat-7-2',
        name: 'Ridge System',
        code: 'ROOF-RIDGE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-7-2-1',
            name: 'Ridge Accessories',
            code: 'ROOF-RIDGE-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Ridge cap', 'Ridge flashing', 'Ridge closure']
          }
        ]
      },
      {
        id: 'cat-7-3',
        name: 'Roof Closures',
        code: 'ROOF-CLOSURE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-7-3-1',
            name: 'Closure Types',
            code: 'ROOF-CLOSURE-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Foam closure', 'Profile closure', 'Bird stopper', 'Dust stopper']
          }
        ]
      },
      {
        id: 'cat-7-4',
        name: 'Roof Seal Systems',
        code: 'ROOF-SEAL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-7-4-1',
            name: 'Seal Types',
            code: 'ROOF-SEAL-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Butyl tape', 'Sealant tape', 'Silicone sealant', 'PU sealant']
          }
        ]
      },
      {
        id: 'cat-7-5',
        name: 'Roof Safety Accessories',
        code: 'ROOF-SAFETY',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-7-5-1',
            name: 'Safety Components',
            code: 'ROOF-SAFETY-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Roof walkways', 'Roof ladders', 'Safety lines', 'Roof anchors']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-8',
    name: 'Wall Cladding Accessories',
    code: 'WALL',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Wall',
    children: [
      {
        id: 'cat-8-1',
        name: 'Wall Panels',
        code: 'WALL-PANEL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-8-1-1',
            name: 'Standard Cladding',
            code: 'WALL-PANEL-STD',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Single skin wall panels', 'Corrugated panels', 'Trapezoidal panels']
          },
          {
            id: 'cat-8-1-2',
            name: 'Insulated Panels',
            code: 'WALL-PANEL-INSUL',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['PUF panels', 'Rockwool panels', 'EPS panels']
          }
        ]
      },
      {
        id: 'cat-8-2',
        name: 'Wall Flashings',
        code: 'WALL-FLASH',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-8-2-1',
            name: 'Flashing Types',
            code: 'WALL-FLASH-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Corner flashing', 'Base flashing', 'Top flashing', 'J trim', 'U trim', 'Drip flashing']
          }
        ]
      },
      {
        id: 'cat-8-3',
        name: 'Joint Systems',
        code: 'WALL-JOINT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-8-3-1',
            name: 'Joint Components',
            code: 'WALL-JOINT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Expansion joints', 'Cover strips', 'Joint sealants']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-9',
    name: 'Insulation Accessories',
    code: 'INSULATION',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Thermometer',
    children: [
      {
        id: 'cat-9-1',
        name: 'Thermal Insulation',
        code: 'INSUL-THERMAL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-9-1-1',
            name: 'Glass Wool',
            code: 'INSUL-THERMAL-GLASS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['24 kg/m³', '32 kg/m³', '48 kg/m³']
          },
          {
            id: 'cat-9-1-2',
            name: 'Rock Wool',
            code: 'INSUL-THERMAL-ROCK',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['40 kg/m³', '60 kg/m³', '80 kg/m³']
          },
          {
            id: 'cat-9-1-3',
            name: 'Foam Insulation',
            code: 'INSUL-THERMAL-FOAM',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['PUF', 'EPS', 'XPS']
          }
        ]
      },
      {
        id: 'cat-9-2',
        name: 'Insulation Fixing Accessories',
        code: 'INSUL-FIX',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-9-2-1',
            name: 'Fixing Components',
            code: 'INSUL-FIX-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Retaining pins', 'Stick pins', 'Adhesive pins', 'Washers', 'Aluminium tape', 'Foil tape']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-10',
    name: 'Ventilation Accessories',
    code: 'VENTILATION',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Wind',
    children: [
      {
        id: 'cat-10-1',
        name: 'Roof Ventilation',
        code: 'VENT-ROOF',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-10-1-1',
            name: 'Ventilator Types',
            code: 'VENT-ROOF-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Turbo ventilators', 'Ridge ventilators', 'Gravity ventilators']
          },
          {
            id: 'cat-10-1-2',
            name: 'Ventilator Accessories',
            code: 'VENT-ROOF-ACC',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Vent curb', 'Vent flashing', 'Bird mesh']
          }
        ]
      },
      {
        id: 'cat-10-2',
        name: 'Wall Ventilation',
        code: 'VENT-WALL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-10-2-1',
            name: 'Wall Vent Types',
            code: 'VENT-WALL-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Louvers', 'Air inlets', 'Exhaust louvers']
          }
        ]
      },
      {
        id: 'cat-10-3',
        name: 'Mechanical Ventilation',
        code: 'VENT-MECH',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-10-3-1',
            name: 'Mechanical Vent Components',
            code: 'VENT-MECH-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Exhaust fans', 'Industrial blowers', 'Air handling units']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-11',
    name: 'Skylight Accessories',
    code: 'SKYLIGHT',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Sun',
    children: [
      {
        id: 'cat-11-1',
        name: 'Skylight Panels',
        code: 'SKY-PANEL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-11-1-1',
            name: 'Skylight Types',
            code: 'SKY-PANEL-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['FRP skylights', 'Polycarbonate skylights', 'Acrylic skylights']
          },
          {
            id: 'cat-11-1-2',
            name: 'Skylight Accessories',
            code: 'SKY-PANEL-ACC',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Skylight curbs', 'Fixing clips', 'Sealing strips']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-12',
    name: 'Gutter & Rainwater Accessories',
    code: 'GUTTER',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Droplets',
    children: [
      {
        id: 'cat-12-1',
        name: 'Gutters',
        code: 'GUTTER-SYS',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-12-1-1',
            name: 'Gutter Types',
            code: 'GUTTER-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Box gutter', 'Valley gutter', 'Eave gutter']
          },
          {
            id: 'cat-12-1-2',
            name: 'Gutter Accessories',
            code: 'GUTTER-ACC',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Gutter bracket', 'Gutter support', 'End cap', 'Expansion joint']
          }
        ]
      },
      {
        id: 'cat-12-2',
        name: 'Downspout System',
        code: 'DOWNSPOUT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-12-2-1',
            name: 'Downspout Components',
            code: 'DOWNSPOUT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Downpipe', 'Elbow', 'Shoe', 'Hopper head', 'Pipe clamp']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-13',
    name: 'Door Accessories',
    code: 'DOOR',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'DoorOpen',
    children: [
      {
        id: 'cat-13-1',
        name: 'Industrial Doors',
        code: 'DOOR-IND',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-13-1-1',
            name: 'Industrial Door Types',
            code: 'DOOR-IND-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Sliding doors', 'Rolling shutters', 'Sectional doors', 'High speed doors']
          },
          {
            id: 'cat-13-1-2',
            name: 'Industrial Door Accessories',
            code: 'DOOR-IND-ACC',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Tracks', 'Rollers', 'Guides', 'Springs', 'Motors']
          }
        ]
      },
      {
        id: 'cat-13-2',
        name: 'Personnel Doors',
        code: 'DOOR-PERS',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-13-2-1',
            name: 'Personnel Door Types',
            code: 'DOOR-PERS-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Steel door', 'Fire door', 'Emergency exit door']
          },
          {
            id: 'cat-13-2-2',
            name: 'Personnel Door Accessories',
            code: 'DOOR-PERS-ACC',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Hinges', 'Panic bars', 'Locks', 'Handles', 'Door closers']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-14',
    name: 'Window Accessories',
    code: 'WINDOW',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Maximize2',
    children: [
      {
        id: 'cat-14-1',
        name: 'Window Types',
        code: 'WINDOW-TYPE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-14-1-1',
            name: 'Window Styles',
            code: 'WINDOW-TYPE-STYLE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Sliding windows', 'Fixed windows', 'Top hung windows', 'Casement windows', 'Louvre windows']
          }
        ]
      },
      {
        id: 'cat-14-2',
        name: 'Window Components',
        code: 'WINDOW-COMP',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-14-2-1',
            name: 'Window Parts',
            code: 'WINDOW-COMP-PARTS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Frame', 'Glass', 'Rubber gasket', 'Beading', 'Handle', 'Lock']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-15',
    name: 'Crane Building Accessories',
    code: 'CRANE',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Crane',
    children: [
      {
        id: 'cat-15-1',
        name: 'Crane Support System',
        code: 'CRANE-SUPPORT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-15-1-1',
            name: 'Crane Support Components',
            code: 'CRANE-SUPPORT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Crane beam', 'Crane bracket', 'Crane girder', 'Rail support beam']
          }
        ]
      },
      {
        id: 'cat-15-2',
        name: 'Rail System',
        code: 'CRANE-RAIL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-15-2-1',
            name: 'Rail Components',
            code: 'CRANE-RAIL-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Crane rails', 'Rail clips', 'Rail pads', 'End stops']
          }
        ]
      },
      {
        id: 'cat-15-3',
        name: 'Safety Components',
        code: 'CRANE-SAFETY',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-15-3-1',
            name: 'Crane Safety Items',
            code: 'CRANE-SAFETY-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Bumpers', 'Buffers', 'Rail clamps']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-16',
    name: 'Mezzanine Accessories',
    code: 'MEZZANINE',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Layout',
    children: [
      {
        id: 'cat-16-1',
        name: 'Decking',
        code: 'MEZZ-DECK',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-16-1-1',
            name: 'Decking Types',
            code: 'MEZZ-DECK-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Metal deck sheet', 'Composite deck', 'Chequered plate']
          }
        ]
      },
      {
        id: 'cat-16-2',
        name: 'Stair Components',
        code: 'MEZZ-STAIR',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-16-2-1',
            name: 'Stair Parts',
            code: 'MEZZ-STAIR-PARTS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Stair stringer', 'Tread plate', 'Landing beam']
          }
        ]
      },
      {
        id: 'cat-16-3',
        name: 'Handrail Components',
        code: 'MEZZ-HANDRAIL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-16-3-1',
            name: 'Handrail Parts',
            code: 'MEZZ-HANDRAIL-PARTS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Handrail post', 'Mid rail', 'Top rail', 'Toe plate']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-17',
    name: 'Fire & Safety Accessories',
    code: 'FIRE',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Flame',
    children: [
      {
        id: 'cat-17-1',
        name: 'Fire Protection',
        code: 'FIRE-PROT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-17-1-1',
            name: 'Fire Protection Items',
            code: 'FIRE-PROT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Fire doors', 'Fire stop sealants', 'Fire barriers', 'Fire rated panels']
          }
        ]
      },
      {
        id: 'cat-17-2',
        name: 'Safety Equipment',
        code: 'FIRE-SAFETY',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-17-2-1',
            name: 'Safety Items',
            code: 'FIRE-SAFETY-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Lifeline systems', 'Safety anchors', 'Roof anchor points']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-18',
    name: 'Architectural Accessories',
    code: 'ARCH',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Building',
    children: [
      {
        id: 'cat-18-1',
        name: 'Fascia System',
        code: 'ARCH-FASCIA',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-18-1-1',
            name: 'Fascia Components',
            code: 'ARCH-FASCIA-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Fascia panel', 'Fascia support', 'Fascia flashing']
          }
        ]
      },
      {
        id: 'cat-18-2',
        name: 'Canopy System',
        code: 'ARCH-CANOPY',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-18-2-1',
            name: 'Canopy Components',
            code: 'ARCH-CANOPY-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Canopy beam', 'Canopy purlin', 'Canopy sheet']
          }
        ]
      },
      {
        id: 'cat-18-3',
        name: 'Parapet System',
        code: 'ARCH-PARAPET',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-18-3-1',
            name: 'Parapet Components',
            code: 'ARCH-PARAPET-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Parapet panel', 'Coping flashing', 'Support bracket']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-19',
    name: 'Painting & Corrosion Protection Accessories',
    code: 'PAINT',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'PaintBucket',
    children: [
      {
        id: 'cat-19-1',
        name: 'Surface Preparation',
        code: 'PAINT-PREP',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-19-1-1',
            name: 'Preparation Materials',
            code: 'PAINT-PREP-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Shot blasting media', 'Sand blasting media']
          }
        ]
      },
      {
        id: 'cat-19-2',
        name: 'Primer System',
        code: 'PAINT-PRIMER',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-19-2-1',
            name: 'Primer Types',
            code: 'PAINT-PRIMER-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Zinc primer', 'Epoxy primer', 'Red oxide primer']
          }
        ]
      },
      {
        id: 'cat-19-3',
        name: 'Finish Coat',
        code: 'PAINT-FINISH',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-19-3-1',
            name: 'Finish Types',
            code: 'PAINT-FINISH-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['PU paint', 'Epoxy paint', 'Polyurethane coating']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-20',
    name: 'Consumable Accessories',
    code: 'CONSUMABLE',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Package',
    children: [
      {
        id: 'cat-20-1',
        name: 'Sealants',
        code: 'CONS-SEAL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-20-1-1',
            name: 'Sealant Types',
            code: 'CONS-SEAL-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Silicone sealant', 'PU sealant', 'Acrylic sealant']
          }
        ]
      },
      {
        id: 'cat-20-2',
        name: 'Tapes',
        code: 'CONS-TAPE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-20-2-1',
            name: 'Tape Types',
            code: 'CONS-TAPE-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Butyl tape', 'Aluminium foil tape', 'Flashing tape']
          }
        ]
      },
      {
        id: 'cat-20-3',
        name: 'Rubber Components',
        code: 'CONS-RUBBER',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-20-3-1',
            name: 'Rubber Items',
            code: 'CONS-RUBBER-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['EPDM gasket', 'Neoprene gasket', 'Rubber packing']
          }
        ]
      },
      {
        id: 'cat-20-4',
        name: 'Plastic Components',
        code: 'CONS-PLASTIC',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-20-4-1',
            name: 'Plastic Items',
            code: 'CONS-PLASTIC-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['End caps', 'Closure plugs', 'Protection caps']
          }
        ]
      },
      {
        id: 'cat-20-5',
        name: 'Miscellaneous',
        code: 'CONS-MISC',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-20-5-1',
            name: 'Misc Items',
            code: 'CONS-MISC-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Cable ties', 'Marker tags', 'Identification plates', 'Warning labels', 'Touch-up paint', 'Thread locker', 'Anti-corrosion spray']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-21',
    name: 'Erection Accessories',
    code: 'ERECTION',
    level: 1,
    categoryType: 'PROCESS',
    icon: 'Wrench',
    children: [
      {
        id: 'cat-21-1',
        name: 'Lifting Accessories',
        code: 'ERECTION-LIFT',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-21-1-1',
            name: 'Lifting Items',
            code: 'ERECTION-LIFT-ITEMS',
            level: 3,
            categoryType: 'PROCESS',
            items: ['Lifting lugs', 'Lifting eyes', 'Lifting plates', 'Shackles', 'Wire rope slings', 'Web slings', 'Chain slings', 'Spreader beams']
          }
        ]
      },
      {
        id: 'cat-21-2',
        name: 'Alignment Accessories',
        code: 'ERECTION-ALIGN',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-21-2-1',
            name: 'Alignment Items',
            code: 'ERECTION-ALIGN-ITEMS',
            level: 3,
            categoryType: 'PROCESS',
            items: ['Temporary bolts', 'Drift pins', 'Alignment pins', 'Erection cleats', 'Temporary supports']
          }
        ]
      },
      {
        id: 'cat-21-3',
        name: 'Temporary Stability',
        code: 'ERECTION-TEMP',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-21-3-1',
            name: 'Stability Items',
            code: 'ERECTION-TEMP-ITEMS',
            level: 3,
            categoryType: 'PROCESS',
            items: ['Temporary bracing', 'Temporary guy wires', 'Temporary anchors']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-22',
    name: 'Expansion Joint Systems',
    code: 'EXPANSION',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'ArrowUpDown',
    children: [
      {
        id: 'cat-22-1',
        name: 'Roof Expansion',
        code: 'EXP-ROOF',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-22-1-1',
            name: 'Roof Expansion Items',
            code: 'EXP-ROOF-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Expansion covers', 'Expansion flashing', 'Sliding joints']
          }
        ]
      },
      {
        id: 'cat-22-2',
        name: 'Wall Expansion',
        code: 'EXP-WALL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-22-2-1',
            name: 'Wall Expansion Items',
            code: 'EXP-WALL-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Expansion caps', 'Expansion seal systems', 'Joint fillers']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-23',
    name: 'Building Maintenance Accessories',
    code: 'MAINTENANCE',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Settings',
    children: [
      {
        id: 'cat-23-1',
        name: 'Roof Access',
        code: 'MAINT-ROOF',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-23-1-1',
            name: 'Roof Access Items',
            code: 'MAINT-ROOF-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Roof ladders', 'Cage ladders', 'Walkways', 'Catwalks']
          }
        ]
      },
      {
        id: 'cat-23-2',
        name: 'Safety',
        code: 'MAINT-SAFETY',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-23-2-1',
            name: 'Safety Items',
            code: 'MAINT-SAFETY-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Roof guard rails', 'Anchor points', 'Lifeline brackets']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-24',
    name: 'Lighting Support Accessories',
    code: 'LIGHTING',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Lightbulb',
    children: [
      {
        id: 'cat-24-1',
        name: 'Structural Supports',
        code: 'LIGHT-STRUCT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-24-1-1',
            name: 'Support Items',
            code: 'LIGHT-STRUCT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Lighting brackets', 'Pole supports', 'High mast supports']
          }
        ]
      },
      {
        id: 'cat-24-2',
        name: 'Cable Management',
        code: 'LIGHT-CABLE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-24-2-1',
            name: 'Cable Items',
            code: 'LIGHT-CABLE-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Cable trays', 'Cable ladders', 'Junction box supports']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-25',
    name: 'Solar Panel Support Accessories',
    code: 'SOLAR',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Sun',
    children: [
      {
        id: 'cat-25-1',
        name: 'Solar Structure',
        code: 'SOLAR-STRUCT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-25-1-1',
            name: 'Solar Structure Items',
            code: 'SOLAR-STRUCT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Solar mounting rails', 'Rail splices', 'Mid clamps', 'End clamps']
          }
        ]
      },
      {
        id: 'cat-25-2',
        name: 'Roof Interface',
        code: 'SOLAR-ROOF',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-25-2-1',
            name: 'Roof Interface Items',
            code: 'SOLAR-ROOF-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Solar flashing', 'Solar brackets', 'Solar anchors']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-26',
    name: 'Bird & Pest Control Accessories',
    code: 'BIRD',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Bird',
    children: [
      {
        id: 'cat-26-1',
        name: 'Bird Protection',
        code: 'BIRD-PROT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-26-1-1',
            name: 'Bird Protection Items',
            code: 'BIRD-PROT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Bird mesh', 'Bird spikes', 'Anti-bird strips']
          }
        ]
      },
      {
        id: 'cat-26-2',
        name: 'Pest Protection',
        code: 'BIRD-PEST',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-26-2-1',
            name: 'Pest Protection Items',
            code: 'BIRD-PEST-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Vermin flashing', 'Rodent barriers']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-27',
    name: 'Special Industrial Accessories',
    code: 'SPECIAL-IND',
    level: 1,
    categoryType: 'SPECIALIZED',
    icon: 'Factory',
    children: [
      {
        id: 'cat-27-1',
        name: 'Clean Room Buildings',
        code: 'SPECIAL-CLEAN',
        level: 2,
        categoryType: 'SPECIALIZED',
        children: [
          {
            id: 'cat-27-1-1',
            name: 'Clean Room Items',
            code: 'SPECIAL-CLEAN-ITEMS',
            level: 3,
            categoryType: 'SPECIALIZED',
            items: ['Hygienic panels', 'Food-grade sealants', 'SS trims']
          }
        ]
      },
      {
        id: 'cat-27-2',
        name: 'Cold Storage Buildings',
        code: 'SPECIAL-COLD',
        level: 2,
        categoryType: 'SPECIALIZED',
        children: [
          {
            id: 'cat-27-2-1',
            name: 'Cold Storage Items',
            code: 'SPECIAL-COLD-ITEMS',
            level: 3,
            categoryType: 'SPECIALIZED',
            items: ['PUF locking systems', 'Vapor barriers', 'Heated door frames']
          }
        ]
      },
      {
        id: 'cat-27-3',
        name: 'Pharmaceutical Buildings',
        code: 'SPECIAL-PHARMA',
        level: 2,
        categoryType: 'SPECIALIZED',
        children: [
          {
            id: 'cat-27-3-1',
            name: 'Pharma Items',
            code: 'SPECIAL-PHARMA-ITEMS',
            level: 3,
            categoryType: 'SPECIALIZED',
            items: ['Flush wall systems', 'GMP panel accessories']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-28',
    name: 'Crane Electrification Accessories',
    code: 'CRANE-ELEC',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Zap',
    children: [
      {
        id: 'cat-28-1',
        name: 'Electrical Supports',
        code: 'CRANE-ELEC-SUPP',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-28-1-1',
            name: 'Electrical Support Items',
            code: 'CRANE-ELEC-SUPP-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Festoon systems', 'Conductor rails', 'Cable trolleys']
          }
        ]
      },
      {
        id: 'cat-28-2',
        name: 'Rail Accessories',
        code: 'CRANE-ELEC-RAIL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-28-2-1',
            name: 'Rail Accessory Items',
            code: 'CRANE-ELEC-RAIL-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Rail joints', 'Fish plates', 'Rail weld kits']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-29',
    name: 'Monitor Roof Accessories',
    code: 'MONITOR',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Monitor',
    children: [
      {
        id: 'cat-29-1',
        name: 'Monitor Structures',
        code: 'MONITOR-STRUCT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-29-1-1',
            name: 'Monitor Items',
            code: 'MONITOR-STRUCT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Monitor frames', 'Monitor louvers', 'Monitor flashing']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-30',
    name: 'Canopy Accessories',
    code: 'CANOPY',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Umbrella',
    children: [
      {
        id: 'cat-30-1',
        name: 'Canopy Drainage',
        code: 'CANOPY-DRAIN',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-30-1-1',
            name: 'Canopy Drainage Items',
            code: 'CANOPY-DRAIN-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Canopy gutters', 'Canopy downpipes']
          }
        ]
      },
      {
        id: 'cat-30-2',
        name: 'Canopy Trim',
        code: 'CANOPY-TRIM',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-30-2-1',
            name: 'Canopy Trim Items',
            code: 'CANOPY-TRIM-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Edge flashing', 'Fascia trim']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-31',
    name: 'Ventilator Accessories',
    code: 'VENTILATOR',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Fan',
    children: [
      {
        id: 'cat-31-1',
        name: 'Turbo Vent Components',
        code: 'VENT-TURBO',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-31-1-1',
            name: 'Turbo Vent Items',
            code: 'VENT-TURBO-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Base plate', 'Neck section', 'Bearing assembly', 'Turbine head']
          }
        ]
      },
      {
        id: 'cat-31-2',
        name: 'Ridge Vent Components',
        code: 'VENT-RIDGE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-31-2-1',
            name: 'Ridge Vent Items',
            code: 'VENT-RIDGE-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['End closure', 'Bird screen', 'Internal baffle']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-32',
    name: 'Sheeting Accessories',
    code: 'SHEETING',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Layers',
    children: [
      {
        id: 'cat-32-1',
        name: 'Sheet Closures',
        code: 'SHEET-CLOSURE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-32-1-1',
            name: 'Sheet Closure Items',
            code: 'SHEET-CLOSURE-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Foam fillers', 'Poly fillers', 'Ridge fillers']
          }
        ]
      },
      {
        id: 'cat-32-2',
        name: 'Sheet Protection',
        code: 'SHEET-PROT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-32-2-1',
            name: 'Sheet Protection Items',
            code: 'SHEET-PROT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Protective film', 'Touch-up paint']
          }
        ]
      },
      {
        id: 'cat-32-3',
        name: 'Sheet Joining',
        code: 'SHEET-JOIN',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-32-3-1',
            name: 'Sheet Joining Items',
            code: 'SHEET-JOIN-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Lap seal tape', 'Stitching strips']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-33',
    name: 'Gaskets & Weatherproofing',
    code: 'GASKET',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Shield',
    children: [
      {
        id: 'cat-33-1',
        name: 'Gaskets',
        code: 'GASKET-TYPE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-33-1-1',
            name: 'Gasket Types',
            code: 'GASKET-TYPE-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['EPDM gaskets', 'Neoprene gaskets', 'Silicone gaskets']
          }
        ]
      },
      {
        id: 'cat-33-2',
        name: 'Weather Seals',
        code: 'GASKET-WEATHER',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-33-2-1',
            name: 'Weather Seal Types',
            code: 'GASKET-WEATHER-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Compression seals', 'Weather strips', 'Expansion seals']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-34',
    name: 'Electrical Building Accessories',
    code: 'ELEC',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Zap',
    children: [
      {
        id: 'cat-34-1',
        name: 'Earthing System',
        code: 'ELEC-EARTH',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-34-1-1',
            name: 'Earthing Items',
            code: 'ELEC-EARTH-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Earth pits', 'Earth strips', 'Copper plates', 'GI strips', 'Earthing clamps']
          }
        ]
      },
      {
        id: 'cat-34-2',
        name: 'Lightning Protection',
        code: 'ELEC-LIGHT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-34-2-1',
            name: 'Lightning Protection Items',
            code: 'ELEC-LIGHT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Lightning arresters', 'Air terminals', 'Down conductors', 'Test joints']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-35',
    name: 'Waterproofing Accessories',
    code: 'WATERPROOF',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Droplets',
    children: [
      {
        id: 'cat-35-1',
        name: 'Roof Waterproofing',
        code: 'WATER-ROOF',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-35-1-1',
            name: 'Roof Waterproofing Items',
            code: 'WATER-ROOF-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['PU membrane', 'Bituminous membrane', 'Acrylic membrane']
          }
        ]
      },
      {
        id: 'cat-35-2',
        name: 'Joint Waterproofing',
        code: 'WATER-JOINT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-35-2-1',
            name: 'Joint Waterproofing Items',
            code: 'WATER-JOINT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Water stops', 'Joint seal systems']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-36',
    name: 'HVAC Support Accessories',
    code: 'HVAC',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Wind',
    children: [
      {
        id: 'cat-36-1',
        name: 'Rooftop Unit Supports',
        code: 'HVAC-RTU',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-36-1-1',
            name: 'RTU Support Items',
            code: 'HVAC-RTU-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['RTU curbs', 'Equipment platforms']
          }
        ]
      },
      {
        id: 'cat-36-2',
        name: 'Duct Supports',
        code: 'HVAC-DUCT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-36-2-1',
            name: 'Duct Support Items',
            code: 'HVAC-DUCT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Duct hangers', 'Duct brackets']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-37',
    name: 'Flooring Accessories',
    code: 'FLOORING',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Square',
    children: [
      {
        id: 'cat-37-1',
        name: 'Industrial Flooring',
        code: 'FLOOR-IND',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-37-1-1',
            name: 'Industrial Flooring Items',
            code: 'FLOOR-IND-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Floor anchors', 'Expansion strips', 'Joint fillers']
          }
        ]
      },
      {
        id: 'cat-37-2',
        name: 'Decking Accessories',
        code: 'FLOOR-DECK',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-37-2-1',
            name: 'Decking Items',
            code: 'FLOOR-DECK-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Shear studs', 'Deck screws', 'Pour stops']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-38',
    name: 'Handrail & Platform Accessories',
    code: 'HANDRAIL',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Handrail',
    children: [
      {
        id: 'cat-38-1',
        name: 'Handrail Components',
        code: 'HANDRAIL-COMP',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-38-1-1',
            name: 'Handrail Items',
            code: 'HANDRAIL-COMP-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Base flange', 'Rail connectors', 'Elbows', 'End caps']
          }
        ]
      },
      {
        id: 'cat-38-2',
        name: 'Platform Components',
        code: 'HANDRAIL-PLAT',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-38-2-1',
            name: 'Platform Items',
            code: 'HANDRAIL-PLAT-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Toe boards', 'Kick plates', 'Grating clips']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-39',
    name: 'Special Structural Accessories',
    code: 'SPECIAL-STRUCT',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Hexagon',
    children: [
      {
        id: 'cat-39-1',
        name: 'Connection Hardware',
        code: 'SPECIAL-CONN',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-39-1-1',
            name: 'Connection Items',
            code: 'SPECIAL-CONN-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Moment connection kits', 'Beam seats', 'Shear tabs', 'End plate kits']
          }
        ]
      },
      {
        id: 'cat-39-2',
        name: 'Reinforcement',
        code: 'SPECIAL-REINF',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-39-2-1',
            name: 'Reinforcement Items',
            code: 'SPECIAL-REINF-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Haunches', 'Cover plates', 'Doubler plates']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-40',
    name: 'Documentation / Tagging Items',
    code: 'DOC',
    level: 1,
    categoryType: 'PROCESS',
    icon: 'FileText',
    children: [
      {
        id: 'cat-40-1',
        name: 'Identification',
        code: 'DOC-ID',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-40-1-1',
            name: 'Identification Items',
            code: 'DOC-ID-ITEMS',
            level: 3,
            categoryType: 'PROCESS',
            items: ['Member tags', 'QR tags', 'Barcode labels', 'Name plates']
          }
        ]
      },
      {
        id: 'cat-40-2',
        name: 'Inspection',
        code: 'DOC-INSP',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-40-2-1',
            name: 'Inspection Items',
            code: 'DOC-INSP-ITEMS',
            level: 3,
            categoryType: 'PROCESS',
            items: ['Inspection markers', 'Welding tags', 'Bolt tightening tags']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-41',
    name: 'Welding Consumables',
    code: 'WELDING',
    level: 1,
    categoryType: 'PROCESS',
    icon: 'Flame',
    children: [
      {
        id: 'cat-41-1',
        name: 'Electrodes',
        code: 'WELD-ELEC',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-41-1-1',
            name: 'Electrode Types',
            code: 'WELD-ELEC-TYPE',
            level: 3,
            categoryType: 'PROCESS',
            items: ['E6013', 'E7018', 'Stainless electrodes']
          }
        ]
      },
      {
        id: 'cat-41-2',
        name: 'Welding Wire',
        code: 'WELD-WIRE',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-41-2-1',
            name: 'Welding Wire Types',
            code: 'WELD-WIRE-TYPE',
            level: 3,
            categoryType: 'PROCESS',
            items: ['MIG wire', 'Flux core wire', 'SAW wire']
          }
        ]
      },
      {
        id: 'cat-41-3',
        name: 'Flux Materials',
        code: 'WELD-FLUX',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-41-3-1',
            name: 'Flux Types',
            code: 'WELD-FLUX-TYPE',
            level: 3,
            categoryType: 'PROCESS',
            items: ['SAW flux', 'Ceramic backing']
          }
        ]
      },
      {
        id: 'cat-41-4',
        name: 'Accessories',
        code: 'WELD-ACC',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-41-4-1',
            name: 'Welding Accessories',
            code: 'WELD-ACC-ITEMS',
            level: 3,
            categoryType: 'PROCESS',
            items: ['Grinding discs', 'Cutting discs', 'Flap discs', 'Wire brushes']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-42',
    name: 'Galvanizing Accessories',
    code: 'GALV',
    level: 1,
    categoryType: 'PROCESS',
    icon: 'Droplets',
    children: [
      {
        id: 'cat-42-1',
        name: 'Hot Dip Galvanizing',
        code: 'GALV-HOT',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-42-1-1',
            name: 'Galvanizing Items',
            code: 'GALV-HOT-ITEMS',
            level: 3,
            categoryType: 'PROCESS',
            items: ['Vent holes', 'Drain holes', 'Touch-up zinc paint']
          }
        ]
      },
      {
        id: 'cat-42-2',
        name: 'Repair Materials',
        code: 'GALV-REPAIR',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-42-2-1',
            name: 'Repair Items',
            code: 'GALV-REPAIR-ITEMS',
            level: 3,
            categoryType: 'PROCESS',
            items: ['Zinc-rich paint', 'Cold galvanizing spray']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-43',
    name: 'Pipe Support Systems',
    code: 'PIPE',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Pipette',
    children: [
      {
        id: 'cat-43-1',
        name: 'Roof Mounted Supports',
        code: 'PIPE-ROOF',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-43-1-1',
            name: 'Roof Support Items',
            code: 'PIPE-ROOF-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Pipe shoes', 'Pipe clamps', 'U-bolts', 'Pipe saddles']
          }
        ]
      },
      {
        id: 'cat-43-2',
        name: 'Utility Supports',
        code: 'PIPE-UTIL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-43-2-1',
            name: 'Utility Support Items',
            code: 'PIPE-UTIL-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Trapeze hangers', 'Threaded rods', 'Support channels']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-44',
    name: 'Utility Penetration Systems',
    code: 'PENETRATION',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'CircleDot',
    children: [
      {
        id: 'cat-44-1',
        name: 'Roof Penetrations',
        code: 'PEN-ROOF',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-44-1-1',
            name: 'Roof Penetration Items',
            code: 'PEN-ROOF-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Pipe flashing boots', 'EPDM boots', 'Cable penetration kits']
          }
        ]
      },
      {
        id: 'cat-44-2',
        name: 'Wall Penetrations',
        code: 'PEN-WALL',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-44-2-1',
            name: 'Wall Penetration Items',
            code: 'PEN-WALL-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Sleeve systems', 'Fire-stop collars']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-45',
    name: 'Industrial Grating Systems',
    code: 'GRATING',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Grid',
    children: [
      {
        id: 'cat-45-1',
        name: 'Gratings',
        code: 'GRAT-TYPE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-45-1-1',
            name: 'Grating Types',
            code: 'GRAT-TYPE-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['MS grating', 'GI grating', 'FRP grating']
          }
        ]
      },
      {
        id: 'cat-45-2',
        name: 'Accessories',
        code: 'GRAT-ACC',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-45-2-1',
            name: 'Grating Accessories',
            code: 'GRAT-ACC-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Grating clips', 'Hold-down clamps', 'Edge trim']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-46',
    name: 'Staircase Accessories',
    code: 'STAIR',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Stairs',
    children: [
      {
        id: 'cat-46-1',
        name: 'Stair Components',
        code: 'STAIR-COMP',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-46-1-1',
            name: 'Stair Parts',
            code: 'STAIR-COMP-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Stringers', 'Treads', 'Landings']
          }
        ]
      },
      {
        id: 'cat-46-2',
        name: 'Safety Items',
        code: 'STAIR-SAFE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-46-2-1',
            name: 'Stair Safety Items',
            code: 'STAIR-SAFE-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Nosing strips', 'Anti-skid strips', 'Handrail brackets']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-47',
    name: 'Platform Accessories',
    code: 'PLATFORM',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Layout',
    children: [
      {
        id: 'cat-47-1',
        name: 'Operating Platforms',
        code: 'PLAT-OP',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-47-1-1',
            name: 'Platform Types',
            code: 'PLAT-OP-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Maintenance platforms', 'Equipment platforms']
          }
        ]
      },
      {
        id: 'cat-47-2',
        name: 'Components',
        code: 'PLAT-COMP',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-47-2-1',
            name: 'Platform Components',
            code: 'PLAT-COMP-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Checker plates', 'Structural grating', 'Kick plates']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-48',
    name: 'Loading Dock Accessories',
    code: 'DOCK',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Truck',
    children: [
      {
        id: 'cat-48-1',
        name: 'Dock Equipment',
        code: 'DOCK-EQUIP',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-48-1-1',
            name: 'Dock Equipment Items',
            code: 'DOCK-EQUIP-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Dock levellers', 'Dock shelters', 'Dock seals']
          }
        ]
      },
      {
        id: 'cat-48-2',
        name: 'Safety',
        code: 'DOCK-SAFE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-48-2-1',
            name: 'Dock Safety Items',
            code: 'DOCK-SAFE-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Wheel guides', 'Rubber bumpers']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-49',
    name: 'Industrial Door Automation',
    code: 'DOOR-AUTO',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Cog',
    children: [
      {
        id: 'cat-49-1',
        name: 'Automation Systems',
        code: 'DOOR-AUTO-SYS',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-49-1-1',
            name: 'Automation Items',
            code: 'DOOR-AUTO-SYS-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Motors', 'Gearboxes', 'Control panels', 'Limit switches']
          }
        ]
      },
      {
        id: 'cat-49-2',
        name: 'Safety Devices',
        code: 'DOOR-AUTO-SAFE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-49-2-1',
            name: 'Safety Device Items',
            code: 'DOOR-AUTO-SAFE-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Photo sensors', 'Safety edges']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-50',
    name: 'Building Monitoring Accessories',
    code: 'MONITOR-BUILD',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Activity',
    children: [
      {
        id: 'cat-50-1',
        name: 'Sensors',
        code: 'MONITOR-SENS',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-50-1-1',
            name: 'Sensor Types',
            code: 'MONITOR-SENS-TYPE',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Temperature sensors', 'Humidity sensors', 'Leak detection sensors']
          }
        ]
      },
      {
        id: 'cat-50-2',
        name: 'Monitoring',
        code: 'MONITOR-SYS',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-50-2-1',
            name: 'Monitoring Items',
            code: 'MONITOR-SYS-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Structural monitoring points', 'Settlement markers']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-51',
    name: 'Seismic Accessories',
    code: 'SEISMIC',
    level: 1,
    categoryType: 'SPECIALIZED',
    icon: 'Activity',
    children: [
      {
        id: 'cat-51-1',
        name: 'Earthquake Resistance',
        code: 'SEISMIC-RESIST',
        level: 2,
        categoryType: 'SPECIALIZED',
        children: [
          {
            id: 'cat-51-1-1',
            name: 'Seismic Items',
            code: 'SEISMIC-RESIST-ITEMS',
            level: 3,
            categoryType: 'SPECIALIZED',
            items: ['Seismic bracing', 'Seismic clips', 'Seismic restraints']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-52',
    name: 'Blast-Resistant Building Accessories',
    code: 'BLAST',
    level: 1,
    categoryType: 'SPECIALIZED',
    icon: 'Shield',
    children: [
      {
        id: 'cat-52-1',
        name: 'Components',
        code: 'BLAST-COMP',
        level: 2,
        categoryType: 'SPECIALIZED',
        children: [
          {
            id: 'cat-52-1-1',
            name: 'Blast Items',
            code: 'BLAST-COMP-ITEMS',
            level: 3,
            categoryType: 'SPECIALIZED',
            items: ['Blast-resistant panels', 'Reinforced doors', 'Energy-absorbing connections']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-53',
    name: 'Data Center PEB Accessories',
    code: 'DATACENTER',
    level: 1,
    categoryType: 'SPECIALIZED',
    icon: 'Server',
    children: [
      {
        id: 'cat-53-1',
        name: 'Specialized Components',
        code: 'DATACENTER-COMP',
        level: 2,
        categoryType: 'SPECIALIZED',
        children: [
          {
            id: 'cat-53-1-1',
            name: 'Data Center Items',
            code: 'DATACENTER-COMP-ITEMS',
            level: 3,
            categoryType: 'SPECIALIZED',
            items: ['Raised floor supports', 'Server platform supports', 'Cable basket systems']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-54',
    name: 'Aircraft Hangar Accessories',
    code: 'HANGAR',
    level: 1,
    categoryType: 'SPECIALIZED',
    icon: 'Plane',
    children: [
      {
        id: 'cat-54-1',
        name: 'Hangar Equipment',
        code: 'HANGAR-EQUIP',
        level: 2,
        categoryType: 'SPECIALIZED',
        children: [
          {
            id: 'cat-54-1-1',
            name: 'Hangar Items',
            code: 'HANGAR-EQUIP-ITEMS',
            level: 3,
            categoryType: 'SPECIALIZED',
            items: ['Large hangar doors', 'Door bogies', 'Bottom guides']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-55',
    name: 'Agricultural PEB Accessories',
    code: 'AGRI',
    level: 1,
    categoryType: 'SPECIALIZED',
    icon: 'Sprout',
    children: [
      {
        id: 'cat-55-1',
        name: 'Farm Buildings',
        code: 'AGRI-FARM',
        level: 2,
        categoryType: 'SPECIALIZED',
        children: [
          {
            id: 'cat-55-1-1',
            name: 'Agricultural Items',
            code: 'AGRI-FARM-ITEMS',
            level: 3,
            categoryType: 'SPECIALIZED',
            items: ['Feed storage bins', 'Vent curtains', 'Livestock partitions']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-56',
    name: 'Food-Grade Accessories',
    code: 'FOOD',
    level: 1,
    categoryType: 'SPECIALIZED',
    icon: 'Apple',
    children: [
      {
        id: 'cat-56-1',
        name: 'Hygienic Systems',
        code: 'FOOD-HYG',
        level: 2,
        categoryType: 'SPECIALIZED',
        children: [
          {
            id: 'cat-56-1-1',
            name: 'Food-Grade Items',
            code: 'FOOD-HYG-ITEMS',
            level: 3,
            categoryType: 'SPECIALIZED',
            items: ['Stainless trims', 'Hygienic sealants', 'Wash-down panels']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-57',
    name: 'Cold Storage Accessories',
    code: 'COLD',
    level: 1,
    categoryType: 'SPECIALIZED',
    icon: 'Snowflake',
    children: [
      {
        id: 'cat-57-1',
        name: 'Refrigeration Related',
        code: 'COLD-REF',
        level: 2,
        categoryType: 'SPECIALIZED',
        children: [
          {
            id: 'cat-57-1-1',
            name: 'Cold Storage Items',
            code: 'COLD-REF-ITEMS',
            level: 3,
            categoryType: 'SPECIALIZED',
            items: ['Heated door frames', 'Vapor barriers', 'Insulated flashings', 'Thermal breaks']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-58',
    name: 'Special Fastener Variants',
    code: 'SPECIAL-FAST',
    level: 1,
    categoryType: 'PRODUCT',
    icon: 'Wrench',
    children: [
      {
        id: 'cat-58-1',
        name: 'Special Fasteners',
        code: 'SPECIAL-FAST-TYPE',
        level: 2,
        categoryType: 'PRODUCT',
        children: [
          {
            id: 'cat-58-1-1',
            name: 'Special Fastener Items',
            code: 'SPECIAL-FAST-TYPE-ITEMS',
            level: 3,
            categoryType: 'PRODUCT',
            items: ['Security bolts', 'Tamper-proof screws', 'Stainless steel bolts', 'Galvanized bolts', 'Teflon-coated fasteners', 'High-temperature fasteners']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-59',
    name: 'Packaging & Dispatch Accessories',
    code: 'PACK',
    level: 1,
    categoryType: 'PROCESS',
    icon: 'Package',
    children: [
      {
        id: 'cat-59-1',
        name: 'Dispatch Materials',
        code: 'PACK-DISP',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-59-1-1',
            name: 'Dispatch Items',
            code: 'PACK-DISP-ITEMS',
            level: 3,
            categoryType: 'PROCESS',
            items: ['Steel strapping', 'PET strapping', 'Edge protectors', 'Stretch wrap']
          }
        ]
      },
      {
        id: 'cat-59-2',
        name: 'Identification',
        code: 'PACK-ID',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-59-2-1',
            name: 'Identification Items',
            code: 'PACK-ID-ITEMS',
            level: 3,
            categoryType: 'PROCESS',
            items: ['Packing labels', 'Bundle tags', 'Shipment tags']
          }
        ]
      }
    ]
  },
  {
    id: 'cat-60',
    name: 'Quality Control Items',
    code: 'QC',
    level: 1,
    categoryType: 'PROCESS',
    icon: 'CheckCircle',
    children: [
      {
        id: 'cat-60-1',
        name: 'Inspection Tools & Consumables',
        code: 'QC-INSPECT',
        level: 2,
        categoryType: 'PROCESS',
        children: [
          {
            id: 'cat-60-1-1',
            name: 'QC Items',
            code: 'QC-INSPECT-ITEMS',
            level: 3,
            categoryType: 'PROCESS',
            items: ['Bolt tension indicators', 'Weld gauges', 'Coating thickness markers', 'Inspection tags']
          }
        ]
      }
    ]
  }
];

// Helper functions
export function getAllCategories(): CategoryNode[] {
  return categoryMasterData;
}

export function getCategoriesByType(type: 'PRODUCT' | 'PROCESS' | 'SPECIALIZED'): CategoryNode[] {
  return categoryMasterData.filter(cat => cat.categoryType === type);
}

export function getCategoryById(id: string): CategoryNode | undefined {
  function search(nodes: CategoryNode[]): CategoryNode | undefined {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = search(node.children);
        if (found) return found;
      }
    }
    return undefined;
  }
  return search(categoryMasterData);
}

export function getSubcategories(parentId: string): CategoryNode[] {
  const parent = getCategoryById(parentId);
  return parent?.children || [];
}

export function getItemTypes(subcategoryId: string): CategoryNode[] {
  const subcategory = getCategoryById(subcategoryId);
  return subcategory?.children || [];
}

export function getAllItemTypesFromCategory(categoryId: string): CategoryNode[] {
  const category = getCategoryById(categoryId);
  if (!category) return [];
  
  const itemTypes: CategoryNode[] = [];
  
  function collectItemTypes(node: CategoryNode) {
    if (node.level === 3 && node.children && node.children.length === 0) {
      // This is an item type (level 3 with no children)
      itemTypes.push(node);
    }
    if (node.children) {
      node.children.forEach(collectItemTypes);
    }
  }
  
  collectItemTypes(category);
  return itemTypes;
}

export function getItemsByCategory(categoryId: string): string[] {
  const category = getCategoryById(categoryId);
  if (!category) return [];
  
  const items: string[] = [];
  const seenItems = new Set<string>();
  
  function collectItems(node: CategoryNode) {
    if (node.items) {
      node.items.forEach(item => {
        if (!seenItems.has(item)) {
          seenItems.add(item);
          items.push(item);
        }
      });
    }
    if (node.children) {
      node.children.forEach(collectItems);
    }
  }
  
  collectItems(category);
  return items;
}

export function getCategoryPath(categoryId: string): string {
  const category = getCategoryById(categoryId);
  if (!category) return '';
  
  const path: string[] = [];
  let current: CategoryNode | undefined = category;
  
  while (current) {
    path.unshift(current.name);
    const parentId: string = current.id.substring(0, current.id.lastIndexOf('-')) || '';
    current = parentId ? getCategoryById(parentId) : undefined;
  }
  
  return path.join(' > ');
}

export interface ItemWithCategory {
  itemName: string;
  categoryId: string;
  itemTypeId: string;
  categoryPath: string;
}

export function getAllItemsFromAllCategories(): ItemWithCategory[] {
  const allItems: ItemWithCategory[] = [];
  const seenItems = new Set<string>(); // Track unique combinations of itemTypeId + itemName
  
  function collectItems(node: CategoryNode, parentPath: string = '') {
    const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;
    
    if (node.items && node.items.length > 0) {
      node.items.forEach(item => {
        // Extract main category id (first segment of the id)
        const mainCategoryId = node.id.split('-')[0];
        const uniqueKey = `${node.id}-${item}`;
        
        // Only add if we haven't seen this combination before
        if (!seenItems.has(uniqueKey)) {
          seenItems.add(uniqueKey);
          allItems.push({
            itemName: item,
            categoryId: mainCategoryId,
            itemTypeId: node.id,
            categoryPath: currentPath,
          });
        }
      });
    }
    
    if (node.children) {
      node.children.forEach(child => collectItems(child, currentPath));
    }
  }
  
  categoryMasterData.forEach(category => collectItems(category));
  return allItems;
}
