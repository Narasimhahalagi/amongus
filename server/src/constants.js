// Tech Among Us Constants - Authentic Skeld Stations & Hands-On Problem-Solving Tasks

export const CREWMATE_COLORS = [
  { id: 'red', name: 'Red', hex: '#C51111' },
  { id: 'blue', name: 'Blue', hex: '#132ED1' },
  { id: 'green', name: 'Green', hex: '#117F2D' },
  { id: 'pink', name: 'Pink', hex: '#ED54BA' },
  { id: 'orange', name: 'Orange', hex: '#EF7D0D' },
  { id: 'yellow', name: 'Yellow', hex: '#F5F557' },
  { id: 'black', name: 'Black', hex: '#3F474E' },
  { id: 'white', name: 'White', hex: '#D6E0F0' },
  { id: 'purple', name: 'Purple', hex: '#6B2FBC' },
  { id: 'cyan', name: 'Cyan', hex: '#38FEDC' },
  { id: 'lime', name: 'Lime', hex: '#50EF39' },
  { id: 'brown', name: 'Brown', hex: '#71491E' }
];

export const TASK_STATIONS = [
  { id: 'task_medbay', name: 'DNA & Memory Diagnostics', room: 'MedBay', x: 416, y: 196 },
  { id: 'task_electrical', name: 'Power Grid Switchboard', room: 'Electrical', x: 370, y: 380 },
  { id: 'task_reactor', name: 'Reactor Core Manifold', room: 'Reactor', x: 130, y: 280 },
  { id: 'task_admin', name: 'Admin Terminal & Records', room: 'Admin', x: 620, y: 300 },
  { id: 'task_cafeteria', name: 'Mainframe Authorization', room: 'Cafeteria', x: 560, y: 150 },
  { id: 'task_navigation', name: 'Trajectory & Algorithmic Plotter', room: 'Navigation', x: 916, y: 286 },
  { id: 'task_weapons', name: 'Targeting Calibrator', room: 'Weapons', x: 780, y: 120 },
  { id: 'task_shields', name: 'Deflector Shield Array', room: 'Shields', x: 752, y: 452 },
  { id: 'task_security', name: 'Firewall & Security Feeds', room: 'Security', x: 310, y: 280 },
  { id: 'task_o2', name: 'Oxygen Regulator & Filters', room: 'O2', x: 712, y: 252 },
  { id: 'task_storage', name: 'Cargo Inventory Stack', room: 'Storage', x: 496, y: 396 },
  { id: 'task_comms', name: 'Comms Frequency Router', room: 'Communications', x: 620, y: 480 },
  { id: 'task_upper_engine', name: 'Upper Fuel Injector', room: 'Upper Engine', x: 216, y: 154 },
  { id: 'task_lower_engine', name: 'Lower Fuel Diverter', room: 'Lower Engine', x: 220, y: 420 }
];

export const TECH_TASKS_BANK = [
  // ==========================================
  // Category 1: Debug the Code (Click the Buggy Line)
  // ==========================================
  {
    id: 'dbg_medbay',
    stationId: 'task_medbay',
    room: 'MedBay',
    stationName: 'DNA & Memory Diagnostics',
    category: 'debug',
    title: 'Array Boundary Overflow',
    language: 'C++',
    description: 'A buffer overflow is corrupting medical scan buffers. Click the exact buggy line.',
    code: [
      'int samples[5] = {12, 24, 36, 48, 60};',
      'for (int i = 0; i <= 5; i++) {',
      '    processDiagnostic(samples[i]);',
      '}'
    ],
    buggyLine: 2,
    explanation: 'Line 2 accesses samples[5] (out-of-bounds)! Array length is 5, valid indices are 0 to 4 (i < 5).'
  },
  {
    id: 'dbg_cafe',
    stationId: 'task_cafeteria',
    room: 'Cafeteria',
    stationName: 'Mainframe Authorization',
    category: 'debug',
    title: 'Assignment Inside Conditional',
    language: 'Java',
    description: 'An accidental assignment in authentication is granting unauthorized root. Click the buggy line.',
    code: [
      'boolean isRoot = false;',
      'int authLevel = getPlayerAuth();',
      'if (authLevel = 100) {',
      '    grantSuperuser();',
      '}'
    ],
    buggyLine: 3,
    explanation: 'Line 3 uses `=` (assignment) instead of `==` (comparison).'
  },
  {
    id: 'dbg_reactor',
    stationId: 'task_reactor',
    room: 'Reactor',
    stationName: 'Reactor Core Manifold',
    category: 'debug',
    title: 'Infinite While Loop',
    language: 'Python',
    description: 'The coolant loop is hanging the system in an infinite freeze. Click the buggy line.',
    code: [
      'coolant_level = 10',
      'while coolant_level > 0:',
      '    inject_liquid_nitrogen()',
      '    coolant_level += 1'
    ],
    buggyLine: 4,
    explanation: 'Line 4 increments coolant_level instead of decrementing it (-= 1), causing an infinite loop!'
  },
  {
    id: 'dbg_weapons',
    stationId: 'task_weapons',
    room: 'Weapons',
    stationName: 'Targeting Calibrator',
    category: 'debug',
    title: 'Const Variable Reassignment',
    language: 'JavaScript',
    description: 'A fatal TypeError is crashing the cannon targeting subroutine. Click the buggy line.',
    code: [
      'const MAX_AMMO = 50;',
      'let currentAmmo = 20;',
      'MAX_AMMO = MAX_AMMO - 1;',
      'firePlasmaTorpedo();'
    ],
    buggyLine: 3,
    explanation: 'Line 3 attempts to reassign a `const` variable (MAX_AMMO), throwing a runtime TypeError!'
  },
  {
    id: 'dbg_security',
    stationId: 'task_security',
    room: 'Security',
    stationName: 'Firewall & Security Feeds',
    category: 'debug',
    title: 'Null Pointer Dereference',
    language: 'C++',
    description: 'Camera feed crashed with segmentation fault. Click the line dereferencing the null pointer.',
    code: [
      'CameraFeed* cam = nullptr;',
      'int camId = 4;',
      'cam->status = ACTIVE;',
      'renderFeed(cam);'
    ],
    buggyLine: 3,
    explanation: 'Line 3 accesses cam->status while cam is still nullptr!'
  },
  {
    id: 'dbg_upper_engine',
    stationId: 'task_upper_engine',
    room: 'Upper Engine',
    stationName: 'Upper Fuel Injector',
    category: 'debug',
    title: 'Missing Colon & Syntax Error',
    language: 'Python',
    description: 'Engine throttle script is failing syntax compilation. Click the line with syntax error.',
    code: [
      'def ignite_thrusters(fuel_psi)',
      '    if fuel_psi > 100:',
      '        return "THRUST_OPTIMAL"',
      '    return "STANDBY"'
    ],
    buggyLine: 1,
    explanation: 'Line 1 is missing the closing colon `:` at the end of the function definition.'
  },

  // ==========================================
  // Category 2: Interactive Code Input / Terminal Solver (Type the Answer)
  // ==========================================
  {
    id: 'input_medbay',
    stationId: 'task_medbay',
    room: 'MedBay',
    stationName: 'DNA & Memory Diagnostics',
    category: 'code_input',
    title: 'Memory Address Calculation',
    language: 'C',
    description: 'Calculate the total bytes consumed by an array of 5 integers (each int = 4 bytes):',
    code: 'int buffer[5];\n// sizeof(int) is 4 bytes.\n// What is sizeof(buffer)?',
    prompt: 'Enter total size in bytes:',
    expectedAnswer: '20',
    explanation: '5 elements * 4 bytes each = 20 bytes.'
  },
  {
    id: 'input_electrical',
    stationId: 'task_electrical',
    room: 'Electrical',
    stationName: 'Power Grid Switchboard',
    category: 'code_input',
    title: 'Ohm’s Law Voltage Calculation',
    language: 'JavaScript',
    description: 'Solve the voltage (V = I * R) for current = 5A and resistance = 12 Ohms:',
    code: 'const current = 5;      // Amperes\nconst resistance = 12;  // Ohms\nconst voltage = current * resistance;\nconsole.log(voltage);',
    prompt: 'Enter voltage output:',
    expectedAnswer: '60',
    explanation: '5 * 12 = 60 Volts.'
  },
  {
    id: 'input_admin',
    stationId: 'task_admin',
    room: 'Admin',
    stationName: 'Admin Terminal & Records',
    category: 'code_input',
    title: 'String Length Calculation',
    language: 'Python',
    description: 'Type the integer length returned by len(room_code):',
    code: 'room_code = "SKELD_2026"\nprint(len(room_code))',
    prompt: 'Enter string length:',
    expectedAnswer: '10',
    explanation: '"SKELD_2026" has exactly 10 characters (5 letters + 1 underscore + 4 digits).'
  },
  {
    id: 'input_cafeteria',
    stationId: 'task_cafeteria',
    room: 'Cafeteria',
    stationName: 'Mainframe Authorization',
    category: 'code_input',
    title: 'Loop Accumulator Output',
    language: 'Java',
    description: 'Type the final integer output of `sum` after loop execution:',
    code: 'int sum = 0;\nfor (int i = 1; i <= 4; i++) {\n    sum += i;\n}\nSystem.out.println(sum);',
    prompt: 'Enter final sum:',
    expectedAnswer: '10',
    explanation: '1 + 2 + 3 + 4 = 10.'
  },
  {
    id: 'input_weapons',
    stationId: 'task_weapons',
    room: 'Weapons',
    stationName: 'Targeting Calibrator',
    category: 'code_input',
    title: 'Bitwise Shift Value',
    language: 'C',
    description: 'Type the resulting decimal value of left shift operation `(1 << 4)`:',
    code: 'int power = 1 << 4;\nprintf("%d", power);',
    prompt: 'Enter resulting decimal integer:',
    expectedAnswer: '16',
    explanation: '1 shifted left by 4 bits is 2^4 = 16.'
  },
  {
    id: 'input_security',
    stationId: 'task_security',
    room: 'Security',
    stationName: 'Firewall & Security Feeds',
    category: 'code_input',
    title: 'Default SSH Port',
    language: 'Networking',
    description: 'Enter the standard default port number for Secure Shell (SSH) communication:',
    code: '// Standard Network Protocols\n// HTTP -> Port 80\n// HTTPS -> Port 443\n// SSH -> Port ?',
    prompt: 'Enter SSH port number:',
    expectedAnswer: '22',
    explanation: 'Port 22 is the standard port reserved for SSH.'
  },
  {
    id: 'input_lower_engine',
    stationId: 'task_lower_engine',
    room: 'Lower Engine',
    stationName: 'Lower Fuel Diverter',
    category: 'code_input',
    title: 'Modulo Arithmetic',
    language: 'Python',
    description: 'Type the remainder returned by the modulo operator `29 % 6`:',
    code: 'fuel_remainder = 29 % 6\nprint(fuel_remainder)',
    prompt: 'Enter remainder output:',
    expectedAnswer: '5',
    explanation: '29 divided by 6 is 4 with remainder 5 (4 * 6 + 5 = 29).'
  },
  {
    id: 'input_storage',
    stationId: 'task_storage',
    room: 'Storage',
    stationName: 'Cargo Inventory Stack',
    category: 'code_input',
    title: 'Stack LIFO Top Element',
    language: 'C++',
    description: 'What value is at the top of the stack after these operations?',
    code: 'stack<int> s;\ns.push(10);\ns.push(20);\ns.pop();\ns.push(30);\ncout << s.top();',
    prompt: 'Enter value of s.top():',
    expectedAnswer: '30',
    explanation: '20 was popped, then 30 was pushed on top of 10. Top element is 30.'
  },

  // ==========================================
  // Category 3: 8-Bit Binary Switchboard (Toggle Switches to Match Target)
  // ==========================================
  {
    id: 'bin_electrical',
    stationId: 'task_electrical',
    room: 'Electrical',
    stationName: 'Power Grid Switchboard',
    category: 'binary_switch',
    title: 'Power Grid Binary Calibrator',
    description: 'Toggle the 8 bit switches (128, 64, 32, 16, 8, 4, 2, 1) to match the target decimal voltage:',
    target: 42,
    bitsRequired: [32, 8, 2],
    explanation: '32 + 8 + 2 = 42 (Binary: 00101010).'
  },
  {
    id: 'bin_reactor',
    stationId: 'task_reactor',
    room: 'Reactor',
    stationName: 'Reactor Core Manifold',
    category: 'binary_switch',
    title: 'Core Frequency Alignment',
    description: 'Align reactor frequency bits to match target value:',
    target: 75,
    bitsRequired: [64, 8, 2, 1],
    explanation: '64 + 8 + 2 + 1 = 75 (Binary: 01001011).'
  },
  {
    id: 'bin_shields',
    stationId: 'task_shields',
    room: 'Shields',
    stationName: 'Deflector Shield Array',
    category: 'binary_switch',
    title: 'Deflector Shield Modulation',
    description: 'Toggle the bit switches to reach the exact shield deflection frequency:',
    target: 100,
    bitsRequired: [64, 32, 4],
    explanation: '64 + 32 + 4 = 100 (Binary: 01100100).'
  },
  {
    id: 'bin_upper_engine',
    stationId: 'task_upper_engine',
    room: 'Upper Engine',
    stationName: 'Upper Fuel Injector',
    category: 'binary_switch',
    title: 'Thrust Vector Bit Mask',
    description: 'Configure thruster binary throttle to reach target pressure:',
    target: 154,
    bitsRequired: [128, 16, 8, 2],
    explanation: '128 + 16 + 8 + 2 = 154 (Binary: 10011010).'
  },

  // ==========================================
  // Category 4: Port & Logic Wiring (Match 4 Connections)
  // ==========================================
  {
    id: 'wire_electrical',
    stationId: 'task_electrical',
    room: 'Electrical',
    stationName: 'Power Grid Switchboard',
    category: 'wire_connect',
    title: 'Network Port Rewiring',
    description: 'Connect each network protocol on the left to its standard port on the right:',
    pairs: [
      { left: 'HTTP', right: 'Port 80' },
      { left: 'HTTPS', right: 'Port 443' },
      { left: 'DNS', right: 'Port 53' },
      { left: 'FTP', right: 'Port 21' }
    ],
    explanation: 'HTTP -> 80, HTTPS -> 443, DNS -> 53, FTP -> 21.'
  },
  {
    id: 'wire_shields',
    stationId: 'task_shields',
    room: 'Shields',
    stationName: 'Deflector Shield Array',
    category: 'wire_connect',
    title: 'Data Type Size Matching',
    description: 'Connect each primitive data type to its standard memory size in C++:',
    pairs: [
      { left: 'bool', right: '1 Bit / Byte' },
      { left: 'char', right: '1 Byte' },
      { left: 'int', right: '4 Bytes' },
      { left: 'double', right: '8 Bytes' }
    ],
    explanation: 'char = 1B, int = 4B, double = 8B, bool = 1B.'
  },
  {
    id: 'wire_comms',
    stationId: 'task_comms',
    room: 'Communications',
    stationName: 'Comms Frequency Router',
    category: 'wire_connect',
    title: 'HTTP Status Code Routing',
    description: 'Connect each HTTP response code to its correct meaning:',
    pairs: [
      { left: '200', right: 'OK' },
      { left: '404', right: 'Not Found' },
      { left: '500', right: 'Internal Server Error' },
      { left: '301', right: 'Moved Permanently' }
    ],
    explanation: '200 OK, 404 Not Found, 500 Server Error, 301 Redirect.'
  },

  // ==========================================
  // Category 5: Algorithm Step Arranger (Reorder 4 Lines into Valid Logic)
  // ==========================================
  {
    id: 'reorder_lower_engine',
    stationId: 'task_lower_engine',
    room: 'Lower Engine',
    stationName: 'Lower Fuel Diverter',
    category: 'reorder',
    title: 'Variable Swap Logic',
    description: 'Rearrange these scrambled lines into the correct chronological order to swap `a` and `b`:',
    lines: [
      { id: 'l1', text: 'int temp = a;' },
      { id: 'l2', text: 'a = b;' },
      { id: 'l3', text: 'b = temp;' },
      { id: 'l4', text: 'return true;' }
    ],
    correctOrder: ['l1', 'l2', 'l3', 'l4'],
    explanation: 'Correct swap sequence: save a in temp -> set a to b -> set b to temp -> return true.'
  },
  {
    id: 'reorder_navigation',
    stationId: 'task_navigation',
    room: 'Navigation',
    stationName: 'Trajectory & Algorithmic Plotter',
    category: 'reorder',
    title: 'Binary Search Step Ordering',
    description: 'Rearrange these lines into the correct execution flow for Binary Search:',
    lines: [
      { id: 'l1', text: 'int mid = low + (high - low) / 2;' },
      { id: 'l2', text: 'if (arr[mid] == target) return mid;' },
      { id: 'l3', text: 'if (arr[mid] < target) low = mid + 1;' },
      { id: 'l4', text: 'else high = mid - 1;' }
    ],
    correctOrder: ['l1', 'l2', 'l3', 'l4'],
    explanation: 'Compute mid -> check equality -> adjust low -> adjust high.'
  },
  {
    id: 'reorder_o2',
    stationId: 'task_o2',
    room: 'O2',
    stationName: 'Oxygen Regulator & Filters',
    category: 'reorder',
    title: 'Filter Initialization Sequence',
    description: 'Arrange these lifecycle steps into correct initialization order:',
    lines: [
      { id: 'l1', text: 'Valve valve = openIntake();' },
      { id: 'l2', text: 'Filter filter = loadHEPA();' },
      { id: 'l3', text: 'valve.connect(filter);' },
      { id: 'l4', text: 'startVentilation();' }
    ],
    correctOrder: ['l1', 'l2', 'l3', 'l4'],
    explanation: 'Open intake -> load filter -> connect -> start ventilation.'
  }
];
