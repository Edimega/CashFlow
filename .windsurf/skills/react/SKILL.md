---
name: react
description: "Skill completo de buenas prácticas en React. Cubre componentes, hooks, estado, rendimiento, data fetching, bundle size, formularios, errores, accesibilidad y patrones avanzados. Basado en Vercel Labs y la documentación oficial de React."
---

# Skill: React Best Practices (Senior Level)

Guía integral de buenas prácticas para desarrollo en React y Next.js. Contiene reglas priorizadas por impacto, basadas en las guías de Vercel Labs (57 reglas en 8 categorías) y la documentación oficial de React.

---

## 1. COMPONENTES Y JSX

### 1.1 Definición de Componentes
- Definir componentes con la palabra clave `function` (no arrow functions) para mejor legibilidad en stack traces
- Usar named exports en lugar de default exports
- Un componente por archivo, nombrado igual que el archivo

```tsx
// ❌ INCORRECT - Arrow function como componente con default export
const UserCard = ({ user }: UserCardProps) => {
  return <div>{user.name}</div>;
};
export default UserCard;

// ✅ CORRECT - Function declaration con named export
export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
}
```

### 1.2 Estructura Interna del Componente
- Seguir un orden consistente dentro de cada componente:
  1. Interfaces / Types de props
  2. Declaraciones de estado (`useState`, `useReducer`)
  3. Valores derivados / computados
  4. Effects (`useEffect`)
  5. Event handlers
  6. Early returns (loading, error)
  7. JSX de retorno

```tsx
// ✅ CORRECT - Orden claro y consistente
interface UserProfileProps {
  userId: string;
  onUpdate: (user: User) => void;
}

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // 1. Estado
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 2. Valores derivados
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  // 3. Effects
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  // 4. Handlers
  const handleSave = async (data: UserFormData) => {
    const updated = await updateUser(userId, data);
    setUser(updated);
    onUpdate(updated);
    setIsEditing(false);
  };

  // 5. Early returns
  if (!user) return <Skeleton />;

  // 6. JSX
  return (
    <div>
      <h1>{fullName}</h1>
      {isEditing ? (
        <UserForm user={user} onSave={handleSave} />
      ) : (
        <UserDetails user={user} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
}
```

### 1.3 Composición sobre Herencia
- Preferir composición de componentes sobre prop drilling
- Usar children y render props para mayor flexibilidad
- Componentes pequeños con responsabilidad única

```tsx
// ❌ INCORRECT - Componente monolítico
export function Dashboard() {
  return (
    <div>
      <header>
        <h1>Dashboard</h1>
        <nav>{/* 50 líneas de nav */}</nav>
      </header>
      <main>
        <div>{/* 100 líneas de métricas */}</div>
        <div>{/* 100 líneas de tabla */}</div>
      </main>
      <footer>{/* 30 líneas de footer */}</footer>
    </div>
  );
}

// ✅ CORRECT - Composición de componentes
export function Dashboard() {
  return (
    <PageLayout>
      <DashboardHeader />
      <MetricsGrid />
      <DataTable />
    </PageLayout>
  );
}
```

### 1.4 Condicionales en JSX
- Usar operador ternario `? :` en lugar de `&&` para evitar render de `0` o `false`
- Convertir la condición a booleano explícitamente si se usa `&&`

```tsx
// ❌ INCORRECT - && puede renderizar 0
{items.length && <ItemList items={items} />}

// ✅ CORRECT - Ternario explícito
{items.length > 0 ? <ItemList items={items} /> : null}

// ✅ CORRECT - Boolean explícito con &&
{Boolean(items.length) && <ItemList items={items} />}
```

### 1.5 Extraer JSX Estático
- Extraer elementos JSX que no dependen de props o estado fuera del componente
- Evita re-creación innecesaria en cada render

```tsx
// ❌ INCORRECT - JSX estático dentro del componente
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <p>© {year} Mi Empresa</p>
      <nav>
        <a href="/terms">Términos</a>
        <a href="/privacy">Privacidad</a>
      </nav>
    </footer>
  );
}

// ✅ CORRECT - Contenido estático extraído
const FOOTER_LINKS = [
  { href: '/terms', label: 'Términos' },
  { href: '/privacy', label: 'Privacidad' },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <p>© {year} Mi Empresa</p>
      <nav>
        {FOOTER_LINKS.map(({ href, label }) => (
          <a key={href} href={href}>{label}</a>
        ))}
      </nav>
    </footer>
  );
}
```

### 1.6 Naming y Organización de Archivos
- Usar kebab-case para directorios y archivos (`components/auth-wizard`)
- Nombres descriptivos de componentes en PascalCase
- Prefijo `handle` para event handlers, prefijo `on` para props de callback

```tsx
// ❌ INCORRECT
<Button onClick={submit} />
const click = () => { ... };

// ✅ CORRECT
<Button onClick={handleSubmit} />
const handleClick = () => { ... };

// En props
interface FormProps {
  onSubmit: (data: FormData) => void;  // on- para callback props
  onCancel: () => void;
}
```

---

## 2. HOOKS

### 2.1 Reglas de Hooks
- **SIEMPRE** llamar hooks en el nivel superior del componente
- **NUNCA** llamar hooks dentro de condicionales, loops o funciones anidadas
- **NUNCA** llamar hooks dentro de funciones regulares (solo componentes y custom hooks)

```tsx
// ❌ INCORRECT - Hook dentro de condicional
export function UserGreeting({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    const [name, setName] = useState('');  // ¡Viola las reglas de hooks!
  }
  return <div>Hello</div>;
}

// ✅ CORRECT - Hook siempre en el top level
export function UserGreeting({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [name, setName] = useState('');

  if (!isLoggedIn) return <div>Please log in</div>;

  return <div>Hello, {name}</div>;
}
```

### 2.2 useState: Inicialización Lazy
- Pasar una función a `useState` para valores costosos de computar
- Evita recalcular el valor inicial en cada render

```tsx
// ❌ INCORRECT - Se ejecuta en cada render
const [data, setData] = useState(expensiveComputation(rawData));

// ✅ CORRECT - Solo se ejecuta en el primer render
const [data, setData] = useState(() => expensiveComputation(rawData));
```

### 2.3 useState: setState Funcional
- Usar la forma funcional cuando el nuevo estado depende del anterior
- Garantiza estabilidad con actualizaciones batched

```tsx
// ❌ INCORRECT - Puede usar estado obsoleto
const handleIncrement = () => {
  setCount(count + 1);
  setCount(count + 1); // Ambos usan el mismo "count"
};

// ✅ CORRECT - Siempre usa el estado actual
const handleIncrement = () => {
  setCount(prev => prev + 1);
  setCount(prev => prev + 1); // Incrementa correctamente 2 veces
};
```

### 2.4 useReducer para Estado Complejo
- Usar `useReducer` cuando el estado tiene múltiples sub-valores relacionados
- Consolidar la lógica de estado en un reducer puro

```tsx
// ❌ INCORRECT - Múltiples useState relacionados
const [items, setItems] = useState<Item[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchItems = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await api.getItems();
    setItems(data);
  } catch (err) {
    setError(String(err));
  } finally {
    setIsLoading(false);
  }
};

// ✅ CORRECT - useReducer para estado cohesivo
interface ItemsState {
  items: Item[];
  isLoading: boolean;
  error: string | null;
}

type ItemsAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Item[] }
  | { type: 'FETCH_ERROR'; error: string };

function itemsReducer(state: ItemsState, action: ItemsAction): ItemsState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { items: action.payload, isLoading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.error };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(itemsReducer, {
  items: [],
  isLoading: false,
  error: null,
});
```

### 2.5 useEffect: Buenas Prácticas
- **SIEMPRE** incluir función de cleanup cuando sea necesario
- **NUNCA** omitir dependencias del array de dependencias
- Preferir event handlers sobre effects para lógica de interacción del usuario
- Usar dependencias primitivas cuando sea posible

```tsx
// ❌ INCORRECT - Sin cleanup, dependencias faltantes
useEffect(() => {
  const interval = setInterval(() => {
    fetchData(userId);
  }, 5000);
}, []); // Falta userId en deps, falta cleanup

// ✅ CORRECT - Con cleanup y dependencias correctas
useEffect(() => {
  const interval = setInterval(() => {
    fetchData(userId);
  }, 5000);

  return () => clearInterval(interval);
}, [userId]);
```

```tsx
// ❌ INCORRECT - Effect para lógica de interacción
useEffect(() => {
  if (submitted) {
    sendAnalytics('form_submitted');
    navigate('/success');
  }
}, [submitted]);

// ✅ CORRECT - Event handler para interacción
const handleSubmit = async (data: FormData) => {
  await saveForm(data);
  sendAnalytics('form_submitted');
  navigate('/success');
};
```

### 2.6 Estado Derivado: Sin useEffect
- **NUNCA** usar `useEffect` para sincronizar estado derivado
- Calcular valores derivados directamente durante el render

```tsx
// ❌ INCORRECT - useEffect para estado derivado
const [items, setItems] = useState<Item[]>([]);
const [filteredItems, setFilteredItems] = useState<Item[]>([]);

useEffect(() => {
  setFilteredItems(items.filter(item => item.isActive));
}, [items]);

// ✅ CORRECT - Calcular durante render
const [items, setItems] = useState<Item[]>([]);
const filteredItems = items.filter(item => item.isActive);

// ✅ CORRECT - Con memoización si es costoso
const [items, setItems] = useState<Item[]>([]);
const filteredItems = useMemo(
  () => items.filter(item => item.isActive),
  [items]
);
```

### 2.7 Custom Hooks
- Extraer lógica reutilizable a custom hooks con prefijo `use`
- Un custom hook = una responsabilidad
- Retornar objetos con nombres descriptivos, no arrays

```tsx
// ✅ CORRECT - Custom hook con responsabilidad clara
function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

// ✅ CORRECT - Custom hook para data fetching
function useFetch<T>(url: string) {
  const [state, dispatch] = useReducer(fetchReducer<T>, initialState);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          dispatch({ type: 'FETCH_ERROR', error: error.message });
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [url]);

  return state; // { data, isLoading, error }
}
```

---

## 3. ESTADO Y PROPS

### 3.1 Inmutabilidad del Estado
- **NUNCA** mutar el estado directamente
- Siempre producir una nueva referencia al actualizar estado

```tsx
// ❌ INCORRECT - Mutación directa
const handleAdd = (newItem: Item) => {
  items.push(newItem);          // ¡Mutación!
  setItems(items);              // React no detecta el cambio
};

const handleUpdate = (id: string, name: string) => {
  const item = items.find(i => i.id === id);
  if (item) item.name = name;   // ¡Mutación!
  setItems([...items]);
};

// ✅ CORRECT - Nuevas referencias
const handleAdd = (newItem: Item) => {
  setItems(prev => [...prev, newItem]);
};

const handleUpdate = (id: string, name: string) => {
  setItems(prev =>
    prev.map(item =>
      item.id === id ? { ...item, name } : item
    )
  );
};

const handleDelete = (id: string) => {
  setItems(prev => prev.filter(item => item.id !== id));
};
```

### 3.2 Evitar Props No Primitivas como Valores por Defecto
- **NUNCA** crear objetos/arrays como valores default inline
- Hoistear valores por defecto fuera del componente

```tsx
// ❌ INCORRECT - Nuevo objeto en cada render, rompe memoización
function UserList({ filters = {} }: UserListProps) {
  // `filters` es referencia diferente en cada render
}

function Chart({ options = { animate: true } }: ChartProps) {
  // `options` es referencia diferente en cada render
}

// ✅ CORRECT - Referencia estable
const DEFAULT_FILTERS: Filters = {};
const DEFAULT_CHART_OPTIONS: ChartOptions = { animate: true };

function UserList({ filters = DEFAULT_FILTERS }: UserListProps) { ... }
function Chart({ options = DEFAULT_CHART_OPTIONS }: ChartProps) { ... }
```

### 3.3 Estado Derivado con Booleanos
- Subscribirse a booleanos derivados en vez de valores "raw"
- Reduce re-renders innecesarios

```tsx
// ❌ INCORRECT - Subscribirse al array completo
function CartBadge() {
  const items = useCartStore(state => state.items);
  return items.length > 0 ? <Badge count={items.length} /> : null;
}

// ✅ CORRECT - Subscribirse solo al booleano derivado
function CartBadge() {
  const hasItems = useCartStore(state => state.items.length > 0);
  const itemCount = useCartStore(state => state.items.length);
  return hasItems ? <Badge count={itemCount} /> : null;
}
```

### 3.4 No Subscribirse a Estado Solo Usado en Callbacks
- Si un valor de estado solo se usa dentro de un event handler, no subscribirse
- Usar refs o selectors que leen al momento de ejecutar

```tsx
// ❌ INCORRECT - Re-render en cada cambio de scrollY
function BackToTop() {
  const scrollY = useStore(state => state.scrollY);
  const handleClick = () => {
    if (scrollY > 100) window.scrollTo(0, 0);
  };
  return <button onClick={handleClick}>Top</button>;
}

// ✅ CORRECT - Leer solo cuando se necesita
function BackToTop() {
  const handleClick = () => {
    const scrollY = useStore.getState().scrollY;
    if (scrollY > 100) window.scrollTo(0, 0);
  };
  return <button onClick={handleClick}>Top</button>;
}
```

---

## 4. RENDIMIENTO

### 4.1 React.memo para Componentes Costosos
- Envolver componentes que reciben las mismas props frecuentemente
- Solo usar cuando se ha verificado un problema de rendimiento

```tsx
// ✅ CORRECT - Memoizar componente costoso de renderizar
const ExpensiveChart = memo(function ExpensiveChart({ data }: ChartProps) {
  // Renderizado costoso con muchos nodos SVG
  return <svg>{/* ... */}</svg>;
});

// ✅ CORRECT - Con comparador personalizado
const UserRow = memo(
  function UserRow({ user, onSelect }: UserRowProps) {
    return <tr onClick={() => onSelect(user.id)}><td>{user.name}</td></tr>;
  },
  (prev, next) => prev.user.id === next.user.id && prev.user.name === next.user.name
);
```

### 4.2 useMemo y useCallback
- `useMemo` para computaciones costosas
- `useCallback` para callbacks pasados a componentes memoizados
- **NUNCA** memoizar expresiones simples o primitivas

```tsx
// ❌ INCORRECT - Memoizar expresión simple
const isAdult = useMemo(() => age >= 18, [age]);
const fullName = useMemo(() => `${first} ${last}`, [first, last]);

// ✅ CORRECT - Sin memo para expresiones simples
const isAdult = age >= 18;
const fullName = `${first} ${last}`;

// ✅ CORRECT - Memoizar computación costosa
const sortedAndFilteredItems = useMemo(
  () => items
    .filter(item => item.status === 'active')
    .sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// ✅ CORRECT - useCallback para callback estable
const handleDelete = useCallback((id: string) => {
  setItems(prev => prev.filter(item => item.id !== id));
}, []);
```

### 4.3 Lazy Loading y Code Splitting
- Usar `React.lazy` y `Suspense` para componentes pesados
- Aplicar dynamic imports en rutas y features opcionales
- Precargar en `hover`/`focus` para velocidad percibida

```tsx
// ✅ CORRECT - Lazy loading de rutas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

export function AppRouter() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// ✅ CORRECT - Preload en hover
const SettingsPage = lazy(() => import('./pages/Settings'));
const preloadSettings = () => import('./pages/Settings');

export function NavLink() {
  return (
    <Link
      to="/settings"
      onMouseEnter={preloadSettings}
      onFocus={preloadSettings}
    >
      Settings
    </Link>
  );
}
```

### 4.4 startTransition para Actualizaciones No Urgentes
- Marcar actualizaciones no urgentes con `startTransition`
- Mantiene la UI responsiva durante actualizaciones costosas

```tsx
// ❌ INCORRECT - Búsqueda bloquea input
const handleSearch = (query: string) => {
  setSearchQuery(query);        // Urgente: actualizar input
  setFilteredResults(filter(query)); // No urgente: puede esperar
};

// ✅ CORRECT - startTransition para lo no urgente
const handleSearch = (query: string) => {
  setSearchQuery(query);
  startTransition(() => {
    setFilteredResults(filter(query));
  });
};
```

### 4.5 useRef para Valores Transitorios de Alta Frecuencia
- Usar refs para valores que cambian frecuentemente pero no afectan el render
- Evita re-renders innecesarios

```tsx
// ❌ INCORRECT - Re-render en cada movimiento del mouse
const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

useEffect(() => {
  const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
  window.addEventListener('mousemove', handler);
  return () => window.removeEventListener('mousemove', handler);
}, []);

// ✅ CORRECT - Ref para posición del mouse
const mousePosRef = useRef({ x: 0, y: 0 });

useEffect(() => {
  const handler = (e: MouseEvent) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
  };
  window.addEventListener('mousemove', handler);
  return () => window.removeEventListener('mousemove', handler);
}, []);
```

### 4.6 content-visibility para Listas Largas
- Usar CSS `content-visibility: auto` para listas off-screen
- El navegador omite el render de elementos no visibles

```tsx
// ✅ CORRECT - Optimizar lista larga con CSS
const listItemStyle: React.CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '0 50px',
};

export function LongList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} style={listItemStyle}>
          <ItemCard item={item} />
        </li>
      ))}
    </ul>
  );
}
```

---

## 5. DATA FETCHING Y WATERFALLS

### 5.1 Eliminar Waterfalls (CRÍTICO)
- **NUNCA** encadenar fetches secuenciales cuando son independientes
- Usar `Promise.all()` para operaciones paralelas
- Mover `await` a la rama donde realmente se usa

```tsx
// ❌ INCORRECT - Waterfall secuencial (lento)
async function loadPageData(userId: string) {
  const user = await fetchUser(userId);
  const posts = await fetchPosts(userId);     // Espera a user innecesariamente
  const comments = await fetchComments(userId); // Espera a posts innecesariamente
  return { user, posts, comments };
}

// ✅ CORRECT - Fetch paralelo (rápido)
async function loadPageData(userId: string) {
  const [user, posts, comments] = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
    fetchComments(userId),
  ]);
  return { user, posts, comments };
}
```

### 5.2 Suspense Boundaries para Streaming
- Envolver componentes de data fetching en `Suspense`
- Permite que partes de la UI se carguen de forma independiente

```tsx
// ✅ CORRECT - Suspense boundaries independientes
export function UserDashboard({ userId }: { userId: string }) {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <UserHeader userId={userId} />
      </Suspense>
      <div className="grid">
        <Suspense fallback={<StatsSkeleton />}>
          <UserStats userId={userId} />
        </Suspense>
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
```

### 5.3 SWR / React Query para Data Fetching del Cliente
- Usar SWR o TanStack Query para deduplicación automática, cache y revalidación
- **NUNCA** implementar data fetching manual con `useEffect` + `useState` en producción

```tsx
// ❌ INCORRECT - Fetch manual sin cache ni dedup
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers)
      .finally(() => setIsLoading(false));
  }, []);

  return { users, isLoading };
}

// ✅ CORRECT - SWR con deduplicación y cache automáticos
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function useUsers() {
  const { data: users, isLoading, error } = useSWR<User[]>(
    '/api/users',
    fetcher
  );
  return { users: users ?? [], isLoading, error };
}
```

### 5.4 Dependencias Parciales
- Cuando un fetch depende de otro, iniciar ambos lo antes posible
- Usar utilidades como `better-all` o iniciar el promise antes del await

```tsx
// ❌ INCORRECT - Waterfall por dependencia total
async function getOrderDetails(orderId: string) {
  const order = await fetchOrder(orderId);
  const products = await fetchProducts(order.productIds);
  const shipping = await fetchShipping(order.shippingId);
  return { order, products, shipping };
}

// ✅ CORRECT - Iniciar independent promises early
async function getOrderDetails(orderId: string) {
  const order = await fetchOrder(orderId);

  const [products, shipping] = await Promise.all([
    fetchProducts(order.productIds),
    fetchShipping(order.shippingId),
  ]);

  return { order, products, shipping };
}
```

---

## 6. BUNDLE SIZE

### 6.1 Evitar Barrel Imports (CRÍTICO)
- Importar directamente del módulo, no del barrel file (`index.ts`)
- Los barrel files incluyen todo el módulo en el bundle

```tsx
// ❌ INCORRECT - Importa todo el barrel
import { Button } from '@/components';
import { formatDate } from '@/utils';

// ✅ CORRECT - Importación directa
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/date';
```

### 6.2 Dynamic Imports para Componentes Pesados
- Usar `next/dynamic` o `React.lazy` para componentes que no son visibles al inicio
- Ideal para modales, charts, editores de texto, etc.

```tsx
// ❌ INCORRECT - Importar siempre (aumenta bundle inicial)
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { ChartLibrary } from 'heavy-chart-lib';

// ✅ CORRECT - Cargar solo cuando se necesita
import dynamic from 'next/dynamic';

const MarkdownEditor = dynamic(
  () => import('@/components/MarkdownEditor'),
  { loading: () => <EditorSkeleton /> }
);

const ChartLibrary = dynamic(
  () => import('heavy-chart-lib').then(mod => mod.Chart),
  { ssr: false }
);
```

### 6.3 Defer Third-Party Scripts
- Cargar analytics, logging y scripts no esenciales después de la hidratación
- Usar `next/script` con strategy `afterInteractive` o `lazyOnload`

```tsx
// ❌ INCORRECT - Cargar analytics inmediatamente
import { Analytics } from 'heavy-analytics-lib';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Analytics />
      {children}
    </>
  );
}

// ✅ CORRECT - Defer después de hidratación
import Script from 'next/script';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script src="https://analytics.example.com/script.js" strategy="lazyOnload" />
    </>
  );
}
```

### 6.4 Carga Condicional de Módulos
- Cargar módulos solo cuando una feature está activa
- Evita incluir código de features no utilizadas

```tsx
// ❌ INCORRECT - Importar siempre
import { AdminPanel } from '@/components/AdminPanel';

export function App({ user }: { user: User }) {
  return user.isAdmin ? <AdminPanel /> : <UserDashboard />;
}

// ✅ CORRECT - Cargar solo si es admin
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('@/components/AdminPanel'));

export function App({ user }: { user: User }) {
  if (!user.isAdmin) return <UserDashboard />;

  return (
    <Suspense fallback={<PanelSkeleton />}>
      <AdminPanel />
    </Suspense>
  );
}
```

---

## 7. FORMULARIOS

### 7.1 Componentes Controlados
- Usar `value` + `onChange` para inputs controlados
- Mantener la fuente de verdad en el estado de React

```tsx
// ✅ CORRECT - Formulario controlado con validación
interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export function ContactForm({ onSubmit }: { onSubmit: (data: ContactFormData) => void }) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleChange = (field: keyof ContactFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateContactForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="name">Nombre</label>
      <input
        id="name"
        type="text"
        value={formData.name}
        onChange={handleChange('name')}
        aria-invalid={!!errors.name}
        aria-describedby={errors.name ? 'name-error' : undefined}
      />
      {errors.name && <span id="name-error" role="alert">{errors.name}</span>}
      {/* ... más campos */}
      <button type="submit">Enviar</button>
    </form>
  );
}
```

### 7.2 useActionState para Acciones Async (React 19+)
- Usar `useActionState` para manejar estado de acciones async
- Combinar con `ErrorBoundary` para errores inesperados

```tsx
// ✅ CORRECT - useActionState para form async
import { useActionState, startTransition } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function CheckoutForm() {
  const [state, dispatchAction, isPending] = useActionState(
    async (prevState: CheckoutState, formData: FormData) => {
      const result = await processOrder(formData);
      if (result.error) {
        return { ...prevState, error: result.error };
      }
      return { orderId: result.orderId, error: null };
    },
    { orderId: null, error: null }
  );

  const handleSubmit = (formData: FormData) => {
    startTransition(() => dispatchAction(formData));
  };

  return (
    <form action={handleSubmit}>
      {/* campos */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Procesando...' : 'Pagar'}
      </button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

---

## 8. MANEJO DE ERRORES

### 8.1 Error Boundaries
- **SIEMPRE** envolver secciones principales en Error Boundaries
- Proporcionar UI de fallback útil con opción de reintentar
- Registrar errores para debugging

```tsx
// ✅ CORRECT - Error Boundary con fallback y logging
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert" className="error-container">
      <h2>Algo salió mal</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Intentar de nuevo</button>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        logErrorToService(error, info.componentStack);
      }}
      onReset={() => {
        // Limpiar estado que pudo causar el error
      }}
    >
      <MainApp />
    </ErrorBoundary>
  );
}
```

### 8.2 Error Boundaries Granulares
- Usar Error Boundaries a nivel de sección, no solo en la raíz
- Permite que una sección falle sin tumbar toda la app

```tsx
// ✅ CORRECT - Boundaries granulares
export function Dashboard() {
  return (
    <div>
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <MetricsPanel />
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <ActivityFeed />
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <NotificationsPanel />
      </ErrorBoundary>
    </div>
  );
}
```

---

## 9. ACCESIBILIDAD (A11Y)

### 9.1 HTML Semántico
- Usar los elementos HTML correctos (`button`, `nav`, `main`, `article`, etc.)
- **NUNCA** usar `div` o `span` como botones o links

```tsx
// ❌ INCORRECT - div como botón
<div onClick={handleClick} className="button">
  Click me
</div>

// ✅ CORRECT - Elemento semántico
<button onClick={handleClick} type="button">
  Click me
</button>
```

### 9.2 Atributos ARIA
- Agregar atributos ARIA cuando HTML semántico no es suficiente
- `aria-label` para elementos sin texto visible
- `aria-live` para contenido dinámico
- `aria-invalid` + `aria-describedby` para errores de formulario

```tsx
// ✅ CORRECT - ARIA completo en formulario
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    value={email}
    onChange={handleChange}
    aria-invalid={!!error}
    aria-describedby={error ? 'email-error' : 'email-hint'}
    aria-required="true"
  />
  <span id="email-hint">Ingresa tu email corporativo</span>
  {error && (
    <span id="email-error" role="alert">
      {error}
    </span>
  )}
</div>
```

### 9.3 Navegación por Teclado
- **TODOS** los elementos interactivos deben ser accesibles por teclado
- Orden de foco lógico con `tabIndex`
- Manejar teclas `Enter`, `Space`, `Escape` donde aplique

```tsx
// ✅ CORRECT - Modal accesible por teclado
export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) modalRef.current?.focus();
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Modal"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {children}
      <button onClick={onClose} aria-label="Cerrar modal">
        ✕
      </button>
    </div>
  );
}
```

### 9.4 Imágenes y Contenido Visual
- **SIEMPRE** incluir `alt` descriptivo en imágenes
- Usar `alt=""` para imágenes decorativas
- Proporcionar texto alternativo para íconos funcionales

```tsx
// ❌ INCORRECT
<img src="/avatar.jpg" />
<button><Icon name="trash" /></button>

// ✅ CORRECT
<img src="/avatar.jpg" alt="Foto de perfil de Juan Pérez" />
<img src="/decorative-line.svg" alt="" role="presentation" />
<button aria-label="Eliminar elemento">
  <Icon name="trash" aria-hidden="true" />
</button>
```

---

## 10. PATRONES AVANZADOS

### 10.1 Context para Estado Global Ligero
- Usar Context para estado que muchos componentes necesitan (tema, auth, i18n)
- **NUNCA** usar Context para estado de alta frecuencia de actualización
- Separar contextos por dominio para evitar re-renders

```tsx
// ✅ CORRECT - Context separados por dominio
const AuthContext = createContext<AuthContextValue | null>(null);
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Custom hook con validación
function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Provider con lógica encapsulada
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo(
    () => ({ user, login, logout, isAuthenticated: !!user }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### 10.2 Compound Components
- Patrón para componentes con partes relacionadas
- Cada sub-componente tiene su responsabilidad

```tsx
// ✅ CORRECT - Compound Component Pattern
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return (
    <TabsContext.Provider value={value}>
      <div role="tablist">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.Tab = function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)!;
  return (
    <button
      role="tab"
      aria-selected={activeTab === id}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function Panel({ id, children }: { id: string; children: React.ReactNode }) {
  const { activeTab } = useContext(TabsContext)!;
  if (activeTab !== id) return null;
  return <div role="tabpanel">{children}</div>;
};

// Uso
<Tabs defaultTab="profile">
  <Tabs.Tab id="profile">Perfil</Tabs.Tab>
  <Tabs.Tab id="settings">Configuración</Tabs.Tab>
  <Tabs.Panel id="profile"><ProfileForm /></Tabs.Panel>
  <Tabs.Panel id="settings"><SettingsForm /></Tabs.Panel>
</Tabs>
```

### 10.3 Render Props para Lógica Reutilizable
- Usar render props cuando custom hooks no son suficientes
- Ideal para lógica que también controla UI

```tsx
// ✅ CORRECT - Render prop para toggle
interface ToggleRenderProps {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export function Toggle({
  children,
  defaultOpen = false,
}: {
  children: (props: ToggleRenderProps) => React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const renderProps: ToggleRenderProps = useMemo(() => ({
    isOpen,
    toggle: () => setIsOpen(prev => !prev),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }), [isOpen]);

  return <>{children(renderProps)}</>;
}

// Uso
<Toggle>
  {({ isOpen, toggle }) => (
    <div>
      <button onClick={toggle}>{isOpen ? 'Cerrar' : 'Abrir'}</button>
      {isOpen && <DropdownMenu />}
    </div>
  )}
</Toggle>
```

### 10.4 Portals para UI Fuera del DOM Tree
- Usar `createPortal` para modales, tooltips y popovers
- El componente mantiene su posición en el React tree pero rinde en otro lugar del DOM

```tsx
// ✅ CORRECT - Portal para modal
import { createPortal } from 'react-dom';

export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

// Uso
export function ConfirmDialog({ isOpen, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <p>¿Estás seguro?</p>
          <button onClick={onConfirm}>Confirmar</button>
          <button onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </Portal>
  );
}
```

### 10.5 Inicialización Única por App
- Ejecutar lógica de setup una sola vez, no en cada render
- Usar bandera a nivel de módulo

```tsx
// ✅ CORRECT - Inicialización one-time
let isInitialized = false;

export function App() {
  if (!isInitialized) {
    isInitialized = true;
    initializeAnalytics();
    initializeSentry();
    registerServiceWorker();
  }

  return <MainApp />;
}
```

---

## 11. NEXT.JS: SERVER COMPONENTS

### 11.1 Minimizar `'use client'`
- Preferir Server Components por defecto
- Solo usar `'use client'` cuando se necesita interactividad, hooks o APIs del browser
- Empujar `'use client'` lo más abajo posible en el árbol de componentes

```tsx
// ❌ INCORRECT - 'use client' demasiado arriba
'use client';

export function ProductPage({ productId }: { productId: string }) {
  const product = useProduct(productId);  // Fetch en cliente
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={productId} />
    </div>
  );
}

// ✅ CORRECT - Server Component + Client Component mínimo
// product-page.tsx (Server Component - por defecto)
export async function ProductPage({ productId }: { productId: string }) {
  const product = await fetchProduct(productId);
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={productId} />  {/* Solo este es client */}
    </div>
  );
}

// add-to-cart-button.tsx
'use client';
export function AddToCartButton({ productId }: { productId: string }) {
  const handleAdd = () => addToCart(productId);
  return <button onClick={handleAdd}>Agregar al carrito</button>;
}
```

### 11.2 Minimizar Datos en Props de Server → Client
- Serializar solo los datos mínimos necesarios para el client component
- Evitar pasar objetos complejos cuando solo se necesitan primitivos

```tsx
// ❌ INCORRECT - Serializar todo el objeto
<UserAvatar user={user} />  // Serializa todo: emails, addresses, etc.

// ✅ CORRECT - Solo lo necesario
<UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
```

### 11.3 React.cache() para Deduplicación por Request
- Usar `React.cache()` para deduplicar llamadas idénticas en un mismo request
- Cada request de servidor tiene su propio cache

```tsx
// ✅ CORRECT - Deduplicación con React.cache
import { cache } from 'react';

export const getUser = cache(async (userId: string): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

// Múltiples componentes pueden llamar getUser(id) en el mismo request
// Solo se ejecuta UNA vez
```

### 11.4 Server Actions: Autenticar Siempre
- **SIEMPRE** validar autenticación y autorización en server actions
- Las server actions son endpoints públicos expuestos

```tsx
// ❌ INCORRECT - Sin autenticación
'use server';
export async function deletePost(postId: string) {
  await db.posts.delete(postId);
}

// ✅ CORRECT - Con autenticación y autorización
'use server';
export async function deletePost(postId: string) {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const post = await db.posts.findUnique({ where: { id: postId } });
  if (post?.authorId !== session.user.id) throw new Error('Forbidden');

  await db.posts.delete({ where: { id: postId } });
  revalidatePath('/posts');
}
```

---

## 12. TYPESCRIPT EN REACT

### 12.1 Tipado de Props y Componentes
- Usar `interface` para props, no `type` (son extensibles)
- Evitar `React.FC` — usar function declarations con tipo de retorno explícito si necesario

```tsx
// ❌ INCORRECT
const Button: React.FC<{ label: string }> = ({ label }) => (
  <button>{label}</button>
);

// ✅ CORRECT
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

export function Button({ label, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

### 12.2 Tipado de Hooks
- Siempre tipar el estado genérico de `useState`
- Tipar retorno de custom hooks explícitamente

```tsx
// ❌ INCORRECT - Tipo inferido como never[]
const [items, setItems] = useState([]);

// ✅ CORRECT - Tipo explícito
const [items, setItems] = useState<Item[]>([]);
const [user, setUser] = useState<User | null>(null);
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
```

### 12.3 Evitar Enums: Usar Maps
- Los enums de TypeScript tienen problemas con tree-shaking
- Usar `as const` objects o union types

```tsx
// ❌ INCORRECT - Enum
enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

// ✅ CORRECT - Union type
type Status = 'active' | 'inactive' | 'pending';

// ✅ CORRECT - Object as const para cuando se necesitan valores
const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const;

type Status = typeof STATUS[keyof typeof STATUS];
```

### 12.4 Tipado de Event Handlers
```tsx
// ✅ CORRECT - Tipos específicos para handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setEmail(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') handleSubmit(e);
};
```

---

## RESUMEN DE REGLAS CRÍTICAS

1. **NUNCA** mutar estado directamente — siempre nuevas referencias
2. **NUNCA** usar `useEffect` para estado derivado — calcular durante render
3. **NUNCA** crear waterfalls de fetch — usar `Promise.all()` para paralelos
4. **NUNCA** importar de barrel files — importar directamente del módulo
5. **NUNCA** usar `div` como botón — usar HTML semántico
6. **NUNCA** omitir cleanup en `useEffect` — siempre limpiar subscripciones/timers
7. **SIEMPRE** usar `ErrorBoundary` en secciones principales
8. **SIEMPRE** incluir atributos de accesibilidad (ARIA, labels, alt)
9. **SIEMPRE** tipar explícitamente estado y props con TypeScript
10. **SIEMPRE** minimizar `'use client'` — empujar al nivel más bajo posible
11. **SIEMPRE** autenticar server actions como si fueran endpoints públicos
12. **SIEMPRE** usar Suspense boundaries para streaming de contenido