---
name: professional-code
description: "This skill defines the principles and patterns that must ALWAYS be applied when writing code. The goal is to produce professional-quality code: efficient, secure, robust, maintainable, and readable."
---

# Skill: Professional Code Standards (Senior Level)

This skill defines the principles and patterns that must ALWAYS be applied when writing code. The goal is to produce professional-quality code: efficient, secure, robust, maintainable, and readable.

---

## 1. FUNDAMENTAL PRINCIPLES

### 1.1 Concise and Efficient Code
- **NEVER** write verbose code when a more elegant alternative exists
- Prefer concise expressions over unnecessary multiple lines
- Every line of code must have a clear purpose

```typescript
// ❌ INCORRECT - Junior verbose code
let status;
if (user.isActive) {
  status = 'active';
} else {
  status = 'inactive';
}

// ✅ CORRECT - Senior concise code
const status = user.isActive ? 'active' : 'inactive';
```

```typescript
// ❌ INCORRECT - Unnecessary multiple ifs
if (role === 'admin') {
  return 'admin';
} else if (role === 'user') {
  return 'user';
} else if (role === 'guest') {
  return 'guest';
} else {
  return 'unknown';
}

// ✅ CORRECT - Use object map or early return
const roleMap = { admin: 'admin', user: 'user', guest: 'guest' };
return roleMap[role] ?? 'unknown';
```

### 1.2 Early Returns (Guard Clauses)
- Exit functions early to avoid excessive nesting
- Validate error conditions at the beginning
- Reduce cognitive complexity of the code

```typescript
// ❌ INCORRECT - Deep nesting
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // main logic
        return doSomething(user);
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// ✅ CORRECT - Guard clauses
function processUser(user) {
  if (!user) return null;
  if (!user.isActive) return null;
  if (!user.hasPermission) return null;
  
  return doSomething(user);
}
```

### 1.3 DRY (Don't Repeat Yourself)
- **NEVER** duplicate logic - extract to functions/hooks/utilities
- If you copy and paste code, you probably need to abstract it
- Create reusable functions with single responsibility

```typescript
// ❌ INCORRECT - Duplicated logic
const formattedDate1 = `${date1.getDate()}/${date1.getMonth() + 1}/${date1.getFullYear()}`;
const formattedDate2 = `${date2.getDate()}/${date2.getMonth() + 1}/${date2.getFullYear()}`;

// ✅ CORRECT - Reusable function
const formatDate = (date: Date): string => 
  `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

const formattedDate1 = formatDate(date1);
const formattedDate2 = formatDate(date2);
```

---

## 2. TYPING AND TYPE SAFETY

### 2.1 Strict Typing
- **NEVER** use `any` - always define specific types
- Use `unknown` when the type is truly unknown and validate afterward
- Define interfaces/types for data structures

```typescript
// ❌ INCORRECT
const fetchData = async (url: string): Promise<any> => { ... }
const handleEvent = (event: any) => { ... }

// ✅ CORRECT
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const fetchData = async <T>(url: string): Promise<ApiResponse<T>> => { ... }
const handleEvent = (event: InputEvent & { target: HTMLInputElement }) => { ... }
```

### 2.2 Null Safety
- Use optional chaining (`?.`) for safe property access
- Use nullish coalescing (`??`) for default values
- Validate data before using it

```typescript
// ❌ INCORRECT - Error prone
const userName = user && user.profile && user.profile.name;
const displayName = userName || 'Anonymous'; // Bug: '' is considered falsy

// ✅ CORRECT - Null safe
const userName = user?.profile?.name;
const displayName = userName ?? 'Anonymous';
```

### 2.3 Type Guards and Validation
- Create type guards for complex validations
- Validate external data (APIs, forms) before using it

```typescript
// ✅ Type guard
const isUser = (data: unknown): data is User => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data
  );
};

// Usage
if (isUser(response.data)) {
  // TypeScript knows response.data is User
  console.log(response.data.email);
}
```

---

## 3. ERROR HANDLING

### 3.1 Specific Try-Catch
- **NEVER** silence errors with empty catches
- Catch specific errors, not generic ones
- Provide descriptive error messages

```typescript
// ❌ INCORRECT - Silenced error
try {
  await saveData(data);
} catch (e) {
  // silenced - NEVER do this
}

// ❌ INCORRECT - Generic message
try {
  await saveData(data);
} catch (e) {
  console.log('Error');
}

// ✅ CORRECT - Specific and descriptive handling
try {
  await saveData(data);
} catch (error) {
  if (error instanceof ValidationError) {
    throw new Error(`Invalid data: ${error.message}`);
  }
  if (error instanceof NetworkError) {
    throw new Error(`Connection error while saving: ${error.message}`);
  }
  throw new Error(`Unexpected error saving data: ${String(error)}`);
}
```

### 3.2 Custom Errors
- Create domain-specific error classes
- Include useful context in errors

```typescript
// ✅ Custom errors
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usage
throw new ApiError('User not found', 404, '/api/users/123');
```

---

## 4. ASYNC/AWAIT AND PROMISES

### 4.1 Proper Async Handling
- Always use async/await over .then() chains
- Handle errors in async operations
- Use Promise.all for independent parallel operations

```typescript
// ❌ INCORRECT - Callback hell / then chains
fetchUser(id)
  .then(user => fetchOrders(user.id))
  .then(orders => fetchProducts(orders))
  .then(products => console.log(products))
  .catch(e => console.log(e));

// ✅ CORRECT - Clean async/await
const loadUserData = async (id: string) => {
  try {
    const user = await fetchUser(id);
    const orders = await fetchOrders(user.id);
    const products = await fetchProducts(orders);
    return products;
  } catch (error) {
    throw new Error(`Error loading user data ${id}: ${String(error)}`);
  }
};
```

### 4.2 Parallel Operations
```typescript
// ❌ INCORRECT - Unnecessary sequential (slow)
const users = await fetchUsers();
const products = await fetchProducts();
const orders = await fetchOrders();

// ✅ CORRECT - Parallel when independent
const [users, products, orders] = await Promise.all([
  fetchUsers(),
  fetchProducts(),
  fetchOrders(),
]);
```

---

## 5. IMMUTABILITY AND STATE

### 5.1 Prefer Immutability
- Use `const` by default, `let` only when necessary
- **NEVER** use `var`
- Don't mutate objects/arrays directly

```typescript
// ❌ INCORRECT - Direct mutation
const user = { name: 'John', age: 30 };
user.age = 31; // Mutation

const numbers = [1, 2, 3];
numbers.push(4); // Mutation

// ✅ CORRECT - Immutable
const user = { name: 'John', age: 30 };
const updatedUser = { ...user, age: 31 };

const numbers = [1, 2, 3];
const newNumbers = [...numbers, 4];
```

### 5.2 Reactive State Management
- Never mutate state directly in any reactive framework
- Always produce a new reference when updating state
- Use the framework's recommended update mechanism

```typescript
// ❌ INCORRECT - Mutating state directly (any framework)
state.items.push(newItem);

// ✅ CORRECT - Producing a new reference
state.items = [...state.items, newItem];

// ✅ CORRECT - For nested objects, spread at every level
const updatedUser = {
  ...user,
  address: { ...user.address, city: 'New City' },
};
```

---

## 6. SEMANTIC NAMING

### 6.1 Descriptive Variables and Functions
- Names should describe purpose, not implementation
- Use verbs for functions, nouns for variables
- Avoid confusing abbreviations

```typescript
// ❌ INCORRECT - Poor names
const d = new Date();
const arr = users.filter(u => u.a);
const fn = (x) => x * 2;
const temp = getData();

// ✅ CORRECT - Semantic names
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
const doubleValue = (value: number) => value * 2;
const userProfile = await fetchUserProfile();
```

### 6.2 Booleans
- Use prefixes: `is`, `has`, `can`, `should`

```typescript
// ❌ INCORRECT
const active = true;
const permission = false;
const loading = true;

// ✅ CORRECT
const isActive = true;
const hasPermission = false;
const isLoading = true;
```

### 6.3 Functions
- Use action verbs: `get`, `set`, `fetch`, `create`, `update`, `delete`, `handle`, `validate`

```typescript
// ❌ INCORRECT
const userData = () => { ... }
const click = () => { ... }

// ✅ CORRECT
const fetchUserData = () => { ... }
const handleClick = () => { ... }
```

---

## 7. FUNCTIONS AND COMPONENTS

### 7.1 Single Responsibility
- Each function should do ONE thing
- If a function does multiple things, split it
- Small functions (ideally max 20-30 lines)

```typescript
// ❌ INCORRECT - Multiple responsibilities
const processUserData = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`);
  const user = await response.json();
  const formattedName = `${user.firstName} ${user.lastName}`.toUpperCase();
  localStorage.setItem('currentUser', JSON.stringify(user));
  sendAnalytics('user_loaded', { userId });
  return { ...user, formattedName };
};

// ✅ CORRECT - Separated responsibilities
const fetchUser = async (userId: string): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

const formatUserName = (user: User): string => 
  `${user.firstName} ${user.lastName}`.toUpperCase();

const cacheUser = (user: User): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

const trackUserLoad = (userId: string): void => {
  sendAnalytics('user_loaded', { userId });
};
```

### 7.2 Pure Functions
- Prefer functions without side effects
- Same input = same output
- Easier testing and debugging

```typescript
// ❌ INCORRECT - Side effect
let total = 0;
const addToTotal = (value: number) => {
  total += value; // Modifies external state
  return total;
};

// ✅ CORRECT - Pure function
const calculateTotal = (values: number[]): number => 
  values.reduce((sum, value) => sum + value, 0);
```

---

## 8. PERFORMANCE AND OPTIMIZATION

### 8.1 Memoize Expensive Computations
- Cache results of expensive calculations to avoid recomputation
- Use the memoization mechanism provided by your framework or a utility
- Only memoize when there is a measurable performance benefit

```typescript
// ❌ INCORRECT - Recalculated on every call / render
const getSortedItems = (items: Item[]): Item[] => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
};

// ✅ CORRECT - Generic memoization utility
const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

const getSortedItems = memoize((items: Item[]): Item[] =>
  [...items].sort((a, b) => a.name.localeCompare(b.name))
);
```

### 8.2 Algorithmic Complexity
- Consider Big O in data operations
- Avoid O(n²) operations when O(n) or O(log n) exists

```typescript
// ❌ INCORRECT - O(n²)
const findDuplicates = (arr: number[]): number[] => {
  return arr.filter((item, index) => arr.indexOf(item) !== index);
};

// ✅ CORRECT - O(n)
const findDuplicates = (arr: number[]): number[] => {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  
  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    }
    seen.add(item);
  }
  
  return [...duplicates];
};
```

### 8.3 Lazy Loading and Code Splitting
- Use dynamic `import()` to split bundles and load code on demand
- Apply lazy loading to routes and heavy components
- Your framework/bundler handles the rest (Vite, Webpack, etc.)

```typescript
// ✅ Dynamic imports for code splitting (works with any bundler)
const loadDashboard = () => import('./pages/Dashboard');
const loadSettings = () => import('./pages/Settings');

// ✅ Lazy loading in route definitions (generic pattern)
const routes = [
  {
    path: '/dashboard',
    component: () => import('./pages/Dashboard'),
  },
  {
    path: '/settings',
    component: () => import('./pages/Settings'),
  },
];
```

---

## 9. SECURITY

### 9.1 Input Validation
- **NEVER** trust user data
- Validate and sanitize all inputs
- Use validation libraries (zod, yup, joi)

```typescript
// ✅ Validation with Zod
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
  age: z.number().min(18, 'Must be of legal age'),
});

const validateUser = (data: unknown) => {
  const result = userSchema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.message);
  }
  return result.data;
};
```

### 9.2 XSS Prevention
- **NEVER** inject raw HTML from user input without sanitizing
- Escape dynamic content before rendering
- Use a sanitization library when rendering HTML is unavoidable

```typescript
// ❌ DANGEROUS - Injecting raw HTML directly
element.innerHTML = userContent;

// ✅ SAFE - Sanitize before injecting
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userContent);

// ✅ SAFER - Use text content when HTML is not needed
element.textContent = userContent;
```

### 9.3 Sensitive Data
- **NEVER** expose secrets in frontend
- Don't log sensitive information
- Use environment variables for configuration

```typescript
// ❌ INCORRECT
const API_KEY = 'sk-1234567890abcdef';
console.log('User password:', password);

// ✅ CORRECT
const API_KEY = process.env.API_KEY; // or import.meta.env depending on bundler
console.log('Login attempt for user:', email); // Without password
```

---

## 10. STRUCTURE AND ORGANIZATION

### 10.1 Ordered Imports
- Group imports by type: external, internal, types, styles
- Alphabetical order within each group

```typescript
// ✅ Organized imports
// 1. Framework core and external libraries
import { z } from 'zod';
import { createRouter } from 'your-router-lib';

// 2. Internal components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// 3. Composables / hooks / utilities
import { useAuth } from '@/composables/useAuth';
import { formatDate } from '@/utils/date';

// 4. Types
import type { User, ApiResponse } from '@/types';

// 5. Styles (if applicable)
import './styles.css';
```

### 10.2 Component / Module Structure
- Follow a consistent internal order within components or modules
- Separate concerns clearly: state, derived data, side effects, output

```typescript
// ✅ Clear internal structure (applicable to any component-based framework)

// 1. Props / Input interface
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

// 2. Local state declarations
// 3. Derived / computed values
// 4. Side effects (watchers, lifecycle, subscriptions)
// 5. Event handlers / methods
// 6. Early returns for loading / error states
// 7. Template / render output
```

```typescript
// ✅ Service / utility module structure

// 1. Type definitions and interfaces
// 2. Constants
// 3. Private helper functions
// 4. Exported public API

interface UserService {
  getById: (id: string) => Promise<User>;
  create: (data: CreateUserDTO) => Promise<User>;
}

const BASE_URL = '/api/users';

const buildUrl = (path: string): string => `${BASE_URL}${path}`;

export const userService: UserService = {
  getById: (id) => httpClient.get(buildUrl(`/${id}`)),
  create: (data) => httpClient.post(buildUrl('/'), data),
};
```

---

## 11. TESTING MINDSET

### 11.1 Testable Code
- Write code that's easy to test
- Inject dependencies instead of hardcoding
- Pure functions are easier to test

```typescript
// ❌ HARD to test
const saveUser = async (user: User) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });
  return response.json();
};

// ✅ EASY to test - Injectable dependency
const createUserService = (httpClient: HttpClient) => ({
  saveUser: async (user: User) => {
    return httpClient.post('/api/users', user);
  },
});

// In tests you can easily mock httpClient
```

---

## 12. USEFUL PATTERNS

### 12.1 Object Lookup vs Switch/If
```typescript
// ❌ INCORRECT
const getStatusColor = (status: string) => {
  switch (status) {
    case 'success': return 'green';
    case 'warning': return 'yellow';
    case 'error': return 'red';
    default: return 'gray';
  }
};

// ✅ CORRECT
const STATUS_COLORS: Record<string, string> = {
  success: 'green',
  warning: 'yellow',
  error: 'red',
};

const getStatusColor = (status: string): string => 
  STATUS_COLORS[status] ?? 'gray';
```

### 12.2 Composition over Inheritance
- Prefer composing small, focused units over deep class hierarchies
- Combine functions, services, or composables to build complex behavior

```typescript
// ❌ INCORRECT - Inheritance for code reuse
class AdminService extends UserService {
  // tightly coupled, hard to test independently
}

// ✅ CORRECT - Composition
const createAdminService = (userService: UserService, permissionService: PermissionService) => ({
  getUser: userService.getById,
  getPermissions: permissionService.getByUserId,
  canEdit: async (userId: string) => {
    const perms = await permissionService.getByUserId(userId);
    return perms.includes('edit');
  },
});
```

### 12.3 Strategy Pattern for Flexible Behavior
```typescript
// ✅ Strategy pattern - swap behavior without conditionals
interface Formatter {
  format: (value: number) => string;
}

const currencyFormatter: Formatter = {
  format: (value) => `$${value.toFixed(2)}`,
};

const percentFormatter: Formatter = {
  format: (value) => `${(value * 100).toFixed(1)}%`,
};

const formatValue = (value: number, formatter: Formatter): string =>
  formatter.format(value);

// Usage
formatValue(0.85, percentFormatter); // "85.0%"
formatValue(42.5, currencyFormatter); // "$42.50"
```

---

## SUMMARY OF CRITICAL RULES

1. **NEVER** use `any` - always specific types
2. **NEVER** silence errors with empty catches
3. **NEVER** mutate state directly
4. **NEVER** duplicate logic - extract and reuse
5. **NEVER** use `var` - only `const` and `let`
6. **ALWAYS** use early returns to reduce nesting
7. **ALWAYS** validate external inputs
8. **ALWAYS** handle errors with descriptive messages
9. **ALWAYS** use semantic and descriptive names
10. **ALWAYS** think about performance and algorithmic complexity
