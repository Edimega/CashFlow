---
name: react-query
description: "Skill completo de buenas prácticas en TanStack Query (React Query v5). Cubre queries, mutations, optimistic updates, cache, prefetching, infinite scroll, SSR, testing y patrones avanzados. Basado en la documentación oficial de TanStack Query v5 y Vercel Labs."
---

# Skill: TanStack Query Best Practices (Senior Level)

Guía integral de buenas prácticas para TanStack Query v5 (React Query). Cubre data fetching, caching, mutations, optimistic updates y patrones avanzados con TypeScript.

> **Nota:** Este skill asume TanStack Query v5 (`@tanstack/react-query`). Las APIs de v4 (`react-query`) son diferentes.

---

## 1. CONFIGURACIÓN Y SETUP

### 1.1 Provider con Defaults Óptimos
- Configurar defaults globales en `QueryClient`
- **SIEMPRE** incluir DevTools en desarrollo

```tsx
// ❌ INCORRECT - Sin defaults, sin DevTools
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function App({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// ✅ CORRECT - Defaults optimizados + DevTools
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 min antes de marcar como stale
      gcTime: 1000 * 60 * 30,         // 30 min en garbage collection (antes cacheTime)
      retry: 2,                        // 2 reintentos automáticos
      refetchOnWindowFocus: true,      // Refrescar al volver a la ventana
      refetchOnReconnect: true,        // Refrescar al reconectarse
    },
    mutations: {
      retry: 1,
    },
  },
});

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 1.2 Estructura de Proyecto
- Separar queries y mutations por feature/dominio
- Usar `queryOptions()` para definiciones tipadas y reutilizables

```
src/
  features/
    users/
      api/
        users.api.ts          # Funciones de API (fetch, create, update)
        users.queries.ts       # queryOptions y custom hooks de queries
        users.mutations.ts     # Custom hooks de mutations
        users.keys.ts          # Query key factory
      components/
        UserList.tsx
        UserForm.tsx
      types/
        users.types.ts
  providers/
    ReactQueryProvider.tsx
```

---

## 2. QUERY KEYS

### 2.1 Query Key Factory (CRÍTICO)
- **SIEMPRE** usar un factory para query keys
- Estructura jerárquica que facilita invalidación granular
- Tipado con `as const` para inferencia correcta

```tsx
// ❌ INCORRECT - Keys dispersas y sin estructura
useQuery({ queryKey: ['users'] });
useQuery({ queryKey: ['users', userId] });
useQuery({ queryKey: ['users', 'list', { page, status }] });
// ¿Cómo invalido todas las queries de users? Hay que recordar cada key

// ✅ CORRECT - Query Key Factory centralizado
export const userKeys = {
  all:     ['users'] as const,
  lists:   ()              => [...userKeys.all, 'list'] as const,
  list:    (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: ()              => [...userKeys.all, 'detail'] as const,
  detail:  (id: string)    => [...userKeys.details(), id] as const,
} as const;

// Uso
useQuery({ queryKey: userKeys.detail(userId) });
useQuery({ queryKey: userKeys.list({ status: 'active', page: 1 }) });

// Invalidación granular
queryClient.invalidateQueries({ queryKey: userKeys.all });          // TODAS las queries de users
queryClient.invalidateQueries({ queryKey: userKeys.lists() });      // Solo las listas
queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });   // Solo un detalle
```

### 2.2 Reglas de Query Keys
- Keys deben ser determinísticas (mismos inputs → misma key)
- Incluir TODOS los parámetros que afectan el resultado
- **NUNCA** incluir valores transitorios (timestamps, randoms)

```tsx
// ❌ INCORRECT - Key no incluye parámetro que afecta el resultado
useQuery({
  queryKey: ['users'],  // Falta status!
  queryFn: () => fetchUsers({ status }),
});

// ❌ INCORRECT - Valores transitorios en la key
useQuery({
  queryKey: ['users', Date.now()],  // Key diferente cada vez = sin cache
  queryFn: () => fetchUsers(),
});

// ✅ CORRECT - Key incluye todos los parámetros relevantes
useQuery({
  queryKey: userKeys.list({ status, page, sortBy }),
  queryFn: () => fetchUsers({ status, page, sortBy }),
});
```

---

## 3. QUERIES

### 3.1 queryOptions para Definiciones Reutilizables
- Usar `queryOptions()` para encapsular key + fn + config
- Permite reutilizar la misma definición en `useQuery`, `prefetch`, `ensureQueryData`

```tsx
// ❌ INCORRECT - Definición inline repetida en varios lugares
// En componente A:
useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 1000 * 60 * 10,
});
// En componente B (copiado):
useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 1000 * 60 * 10,
});

// ✅ CORRECT - queryOptions reutilizable
import { queryOptions } from '@tanstack/react-query';

export const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUser(userId),
    staleTime: 1000 * 60 * 10,
  });

// Uso en cualquier componente
useQuery(userQueryOptions(userId));

// Uso en prefetch
queryClient.prefetchQuery(userQueryOptions(userId));

// Uso en loader
const user = await queryClient.ensureQueryData(userQueryOptions(userId));
```

### 3.2 Custom Query Hooks
- Encapsular `useQuery` en hooks personalizados por dominio
- Incluir tipado genérico explícito en el retorno
- Documentar el propósito del hook

```tsx
// ❌ INCORRECT - useQuery inline en el componente
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
    enabled: !!userId,
  });
  // ...
}

// ✅ CORRECT - Custom hook reutilizable
/** Obtiene los datos de un usuario por ID */
export function useUser(userId: string) {
  return useQuery({
    ...userQueryOptions(userId),
    enabled: !!userId,
  });
}

/** Obtiene la lista de usuarios con filtros opcionales */
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsers(filters),
    placeholderData: keepPreviousData,  // Mantener datos prev mientras carga
  });
}

// Uso limpio en componente
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);
  // ...
}
```

### 3.3 Queries Dependientes
- Usar la opción `enabled` para queries que dependen de otros datos
- **NUNCA** hacer conditional hooks — usar `enabled` en su lugar

```tsx
// ❌ INCORRECT - Hook condicional (VIOLA reglas de hooks)
function UserPosts({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  
  if (user) {
    const { data: posts } = useQuery({ ... }); // ¡ERROR!
  }
}

// ✅ CORRECT - enabled para queries dependientes
function UserPosts({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => fetchUserPosts(user!.id),
    enabled: !!user,  // Solo ejecutar cuando user existe
  });
}
```

### 3.4 select para Transformar/Filtrar Datos
- Usar `select` para derivar datos sin afectar el cache
- Reduce re-renders al subscribirse solo a la porción necesaria

```tsx
// ❌ INCORRECT - Transformar en el componente
function ActiveUserCount() {
  const { data: users } = useUsers();
  const activeCount = users?.filter(u => u.isActive).length ?? 0;
  // Se re-renderiza con CUALQUIER cambio en users
  return <span>{activeCount}</span>;
}

// ✅ CORRECT - Transformar con select
function ActiveUserCount() {
  const { data: activeCount } = useQuery({
    ...usersQueryOptions(),
    select: (users) => users.filter(u => u.isActive).length,
    // Solo re-renderiza cuando el COUNT cambia
  });
  return <span>{activeCount}</span>;
}

// ✅ CORRECT - Seleccionar solo un campo
function useUserName(userId: string) {
  return useQuery({
    ...userQueryOptions(userId),
    select: (user) => user.name,
  });
}
```

### 3.5 Manejo Completo de Estados
- **SIEMPRE** manejar los 3 estados: loading, error, success
- Usar `isPending` (no `isLoading`) en v5 para el estado de primera carga
- Usar `isFetching` para background refetch indicator

```tsx
// ❌ INCORRECT - Solo maneja success
function UserList() {
  const { data } = useUsers();
  return <ul>{data?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// ✅ CORRECT - Manejo completo de estados
function UserList() {
  const { data: users, isPending, error, isFetching } = useUsers();

  if (isPending) return <UserListSkeleton />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  return (
    <div>
      {isFetching && <RefreshIndicator />}
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 4. MUTATIONS

### 4.1 Custom Mutation Hooks
- Encapsular `useMutation` en hooks por dominio
- **SIEMPRE** invalidar queries relacionadas en `onSuccess` o `onSettled`
- Tipar `mutationFn`, error y variables

```tsx
// ❌ INCORRECT - Mutation inline sin invalidación
function CreateUserButton() {
  const mutation = useMutation({
    mutationFn: (data: CreateUserDTO) => 
      fetch('/api/users', { method: 'POST', body: JSON.stringify(data) }),
    // ¡Sin invalidación! La lista no se actualiza
  });
}

// ✅ CORRECT - Custom mutation hook con invalidación
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDTO) => createUser(data),
    onSuccess: (newUser) => {
      // Invalidar listas para que se refresquen
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Opcionalmente, setear el nuevo user en cache directo
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
    },
    onError: (error: Error) => {
      toast.error(`Error al crear usuario: ${error.message}`);
    },
  });
}

// Uso en componente
function CreateUserForm() {
  const createUser = useCreateUser();

  const handleSubmit = (data: CreateUserDTO) => {
    createUser.mutate(data, {
      onSuccess: () => navigate('/users'),
    });
  };

  return (
    <form onSubmit={handleFormSubmit(handleSubmit)}>
      {/* campos */}
      <button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? 'Creando...' : 'Crear usuario'}
      </button>
    </form>
  );
}
```

### 4.2 mutateAsync vs mutate
- Usar `mutate` cuando el side effect se maneja en callbacks
- Usar `mutateAsync` cuando necesitas `await` y control de flujo

```tsx
// ✅ CORRECT - mutate con callbacks (más común)
const handleCreate = () => {
  createUser.mutate(formData, {
    onSuccess: (user) => {
      toast.success('Usuario creado');
      navigate(`/users/${user.id}`);
    },
  });
};

// ✅ CORRECT - mutateAsync cuando necesitas await
const handleCreateAndInvite = async () => {
  try {
    const user = await createUser.mutateAsync(formData);
    await inviteUser.mutateAsync(user.id);
    toast.success('Usuario creado e invitado');
  } catch (error) {
    // El error ya lo maneja el hook, pero puedes agregar lógica extra
  }
};
```

### 4.3 Invalidación Inteligente
- Invalidar de forma granular, no todo el cache
- Usar `exact` para invalidar una key específica
- Usar `predicate` para invalidación condicional

```tsx
// ❌ INCORRECT - Invalida TODO (demasiado agresivo)
queryClient.invalidateQueries();

// ❌ INCORRECT - Invalida todas las queries de users (puede ser mucho)
queryClient.invalidateQueries({ queryKey: ['users'] });

// ✅ CORRECT - Invalidación granular
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) =>
      updateUser(id, data),
    onSuccess: (updatedUser, { id }) => {
      // Actualizar cache del detalle directamente
      queryClient.setQueryData(userKeys.detail(id), updatedUser);
      
      // Invalidar solo las listas (porque el orden puede cambiar)
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

---

## 5. OPTIMISTIC UPDATES

### 5.1 Patrón Completo con Rollback
- Cancelar queries activas antes de actualizar cache
- Hacer snapshot del estado previo para rollback
- Invalidar en `onSettled` para sincronizar con servidor

```tsx
// ✅ CORRECT - Optimistic update completo (TanStack Query v5)
export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (todo: Todo) =>
      updateTodo({ ...todo, done: !todo.done }),

    onMutate: async (updatedTodo, context) => {
      // 1. Cancelar queries activas para evitar sobrescribir
      await context.client.cancelQueries({ queryKey: todoKeys.lists() });

      // 2. Snapshot del estado previo
      const previousTodos = context.client.getQueryData<Todo[]>(
        todoKeys.list('all')
      );

      // 3. Actualizar cache optimistamente
      context.client.setQueryData<Todo[]>(
        todoKeys.list('all'),
        (old) =>
          old?.map(t =>
            t.id === updatedTodo.id ? { ...t, done: !t.done } : t
          ) ?? []
      );

      // 4. Retornar snapshot para rollback
      return { previousTodos };
    },

    onError: (_err, _variables, onMutateResult, context) => {
      // 5. Rollback en caso de error
      if (onMutateResult?.previousTodos) {
        context.client.setQueryData(
          todoKeys.list('all'),
          onMutateResult.previousTodos
        );
      }
    },

    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      // 6. Siempre revalidar para sincronizar con servidor
      context.client.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}
```

### 5.2 Cuándo Usar (y Cuándo NO) Optimistic Updates
- ✅ Usar para toggles, likes, bookmarks (cambios reversibles y predecibles)
- ✅ Usar para reordenamiento de listas (drag and drop)
- ❌ NO usar para creación de entidades (no tienes el ID del servidor)
- ❌ NO usar para operaciones complejas con validación server-side

```tsx
// ❌ INCORRECT - Optimistic update para crear (no hay ID aún)
onMutate: async (newUser) => {
  queryClient.setQueryData(['users'], old => [
    ...old,
    { ...newUser, id: 'temp-id' },  // 🐛 ID inventado = problemas
  ]);
}

// ✅ CORRECT - Para creación, usar invalidación simple
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}
```

---

## 6. PAGINACIÓN E INFINITE SCROLL

### 6.1 Paginación con keepPreviousData
- Usar `placeholderData: keepPreviousData` para mantener datos mientras carga la siguiente página
- Evita flicker entre páginas

```tsx
// ❌ INCORRECT - Sin keepPreviousData (flicker entre páginas)
function UserList() {
  const [page, setPage] = useState(1);
  const { data, isPending } = useQuery({
    queryKey: userKeys.list({ page }),
    queryFn: () => fetchUsers({ page }),
    // Al cambiar page, isPending = true y se pierde la UI
  });
}

// ✅ CORRECT - Con keepPreviousData
import { keepPreviousData } from '@tanstack/react-query';

function UserList() {
  const [page, setPage] = useState(1);

  const { data, isPending, isPlaceholderData, isFetching } = useQuery({
    queryKey: userKeys.list({ page }),
    queryFn: () => fetchUsers({ page }),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      {isPending ? (
        <UserListSkeleton />
      ) : (
        <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
          {data.users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
      <div>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span>Página {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={isPlaceholderData || !data?.hasMore}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

### 6.2 Infinite Scroll
- Usar `useInfiniteQuery` para scroll infinito
- Implementar `getNextPageParam` correctamente
- Aplanar `pages` para renderizar

```tsx
// ✅ CORRECT - Infinite scroll completo
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteUsers(filters: UserFilters) {
  return useInfiniteQuery({
    queryKey: userKeys.list({ ...filters, type: 'infinite' }),
    queryFn: ({ pageParam }) => fetchUsers({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    getPreviousPageParam: (firstPage) => firstPage.prevCursor ?? undefined,
  });
}

// Componente con intersection observer
function InfiniteUserList() {
  const {
    data,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUsers({ status: 'active' });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  if (isPending) return <UserListSkeleton />;

  return (
    <ul>
      {data.pages.flatMap(page =>
        page.users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))
      )}
      <div ref={loadMoreRef}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </ul>
  );
}
```

---

## 7. PREFETCHING Y CACHE PRIMING

### 7.1 Prefetch en Hover/Focus
- Precargar datos cuando el usuario muestra intención
- Mejora percepción de velocidad sin cargar innecesariamente

```tsx
// ✅ CORRECT - Prefetch en hover
function UserListItem({ user }: { user: UserSummary }) {
  const queryClient = useQueryClient();

  const handlePrefetch = () => {
    queryClient.prefetchQuery(userQueryOptions(user.id));
  };

  return (
    <li>
      <Link
        to={`/users/${user.id}`}
        onMouseEnter={handlePrefetch}
        onFocus={handlePrefetch}
      >
        {user.name}
      </Link>
    </li>
  );
}
```

### 7.2 Priming Cache desde Listas
- Cuando una lista ya tiene los datos del detalle, poblar cache del detalle
- Evita un fetch redundante al navegar al detalle

```tsx
// ✅ CORRECT - Poblar cache de detalles desde la lista
export function useUsers(filters: UserFilters = {}) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const users = await fetchUsers(filters);

      // Poblar cache individual para cada usuario
      users.forEach(user => {
        queryClient.setQueryData(userKeys.detail(user.id), user);
      });

      return users;
    },
  });
}
```

### 7.3 placeholderData vs initialData
- `placeholderData` — datos temporales que NO se escriben al cache
- `initialData` — datos que SÍ se escriben al cache como si vinieran del servidor

```tsx
// ✅ CORRECT - placeholderData para datos provisionales
function UserDetail({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    ...userQueryOptions(userId),
    // Usar datos de la lista como placeholder mientras carga el detalle completo
    placeholderData: () => {
      const allUsers = queryClient.getQueryData<User[]>(userKeys.list({}));
      return allUsers?.find(u => u.id === userId);
    },
  });
}

// ✅ CORRECT - initialData para datos de SSR
function UserDetail({ userId, serverUser }: { userId: string; serverUser: User }) {
  const { data: user } = useQuery({
    ...userQueryOptions(userId),
    initialData: serverUser,
    initialDataUpdatedAt: Date.now(), // Para calcular staleTime correctamente
  });
}
```

---

## 8. ERROR HANDLING

### 8.1 Error Handling Global
- Configurar handler global para queries y mutations
- Usar para logging centralizado

```tsx
// ✅ CORRECT - Global error handler
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error) => {
        // Solo lanzar para errores críticos (error boundary los captura)
        return error instanceof AuthenticationError;
      },
    },
    mutations: {
      onError: (error: Error) => {
        // Handler global para mutaciones
        if (error instanceof NetworkError) {
          toast.error('Error de conexión. Verifica tu red.');
          return;
        }
        toast.error(error.message);
      },
    },
  },
});
```

### 8.2 QueryErrorResetBoundary
- Usar con `react-error-boundary` para reset automático de queries con error
- Permite reintentar la operación fallida

```tsx
// ✅ CORRECT - Error Boundary integrado con React Query
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

export function QueryBoundary({ children }: { children: React.ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div role="alert">
              <h3>Error al cargar datos</h3>
              <p>{error.message}</p>
              <button onClick={resetErrorBoundary}>Reintentar</button>
            </div>
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

// Uso
<QueryBoundary>
  <UserProfile userId={userId} />
</QueryBoundary>
```

### 8.3 Retry Personalizado
- Configurar retry de forma inteligente según el tipo de error
- **NUNCA** reintentar errores de validación (4xx)

```tsx
// ✅ CORRECT - Retry inteligente
useQuery({
  queryKey: userKeys.detail(userId),
  queryFn: () => fetchUser(userId),
  retry: (failureCount, error) => {
    // No reintentar errores de cliente
    if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
      return false;
    }
    // Reintentar hasta 3 veces para errores de servidor/red
    return failureCount < 3;
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### 8.4 Funciones de API con Errores Descriptivos
- Las funciones de fetch deben lanzar errores descriptivos
- **NUNCA** dejar que TanStack Query reciba un response no-ok como éxito

```tsx
// ❌ INCORRECT - No verifica response.ok
export async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();  // 🐛 Si es 404, devuelve HTML de error como "data"
}

// ✅ CORRECT - Error handling explícito
export async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError('Usuario no encontrado', 404);
    }
    if (response.status === 403) {
      throw new ApiError('No tienes permisos para ver este usuario', 403);
    }
    throw new ApiError(
      `Error al cargar usuario: ${response.statusText}`,
      response.status
    );
  }

  return response.json();
}
```

---

## 9. SUSPENSE Y STREAMING

### 9.1 useSuspenseQuery
- Usar `useSuspenseQuery` para integración con React Suspense
- El tipo de data nunca es `undefined` (siempre tiene datos o suspende)

```tsx
// ❌ INCORRECT - useQuery + null checks manuales
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isPending, error } = useQuery(userQueryOptions(userId));

  if (isPending) return <Skeleton />;
  if (error) return <ErrorMessage />;
  // data podría ser undefined
  return <div>{user?.name}</div>;
}

// ✅ CORRECT - useSuspenseQuery + Suspense boundary
import { useSuspenseQuery } from '@tanstack/react-query';

function UserProfile({ userId }: { userId: string }) {
  // data nunca es undefined, el componente suspende hasta tener datos
  const { data: user } = useSuspenseQuery(userQueryOptions(userId));

  return <div>{user.name}</div>;  // ✅ Sin null check
}

// Envolver en Suspense + ErrorBoundary
<QueryBoundary>
  <Suspense fallback={<ProfileSkeleton />}>
    <UserProfile userId={userId} />
  </Suspense>
</QueryBoundary>
```

### 9.2 useSuspenseQueries para Queries Paralelas
- Ejecutar múltiples queries simultáneamente con Suspense
- Todas las queries deben resolver antes de renderizar

```tsx
// ✅ CORRECT - Queries paralelas con Suspense
import { useSuspenseQueries } from '@tanstack/react-query';

function UserDashboard({ userId }: { userId: string }) {
  const [
    { data: user },
    { data: posts },
    { data: stats },
  ] = useSuspenseQueries({
    queries: [
      userQueryOptions(userId),
      userPostsQueryOptions(userId),
      userStatsQueryOptions(userId),
    ],
  });

  // Todos los datos garantizados disponibles
  return (
    <div>
      <h1>{user.name}</h1>
      <PostsList posts={posts} />
      <StatsPanel stats={stats} />
    </div>
  );
}
```

---

## 10. SERVER-SIDE RENDERING (SSR) Y NEXT.JS

### 10.1 Prefetch en Server Components (Next.js App Router)
- Prefetch en el servidor y deshidratar para el cliente
- Evita waterfalls y carga inmediata

```tsx
// ✅ CORRECT - SSR con prefetch en Next.js App Router
// app/users/[id]/page.tsx (Server Component)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

export default async function UserPage({ params }: { params: { id: string } }) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(userQueryOptions(params.id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProfile userId={params.id} />
    </HydrationBoundary>
  );
}

// components/UserProfile.tsx (Client Component)
'use client';
export function UserProfile({ userId }: { userId: string }) {
  // Los datos ya están en cache gracias al prefetch del servidor
  const { data: user } = useSuspenseQuery(userQueryOptions(userId));
  return <div>{user.name}</div>;
}
```

### 10.2 Prefetch Múltiple en Parallel
- Usar `Promise.all` para prefetch paralelo en el servidor

```tsx
// ✅ CORRECT - Prefetch paralelo en servidor
export default async function DashboardPage() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(usersQueryOptions()),
    queryClient.prefetchQuery(statsQueryOptions()),
    queryClient.prefetchQuery(notificationsQueryOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Dashboard />
    </HydrationBoundary>
  );
}
```

---

## 11. TESTING

### 11.1 Setup para Tests
- Crear un `QueryClient` fresco por test
- Desactivar retries y GC en tests

```tsx
// ✅ CORRECT - Test wrapper
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

export function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

### 11.2 Testear Custom Hooks
- Usar `renderHook` con el wrapper de QueryClient
- Esperar a que la query resuelva con `waitFor`

```tsx
// ✅ CORRECT - Test de custom hook
import { renderHook, waitFor } from '@testing-library/react';

describe('useUser', () => {
  it('debe retornar los datos del usuario', async () => {
    // Mock API
    server.use(
      rest.get('/api/users/:id', (req, res, ctx) =>
        res(ctx.json({ id: '1', name: 'Juan' }))
      )
    );

    const { result } = renderHook(() => useUser('1'), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ id: '1', name: 'Juan' });
  });
});
```

---

## 12. PATRONES AVANZADOS

### 12.1 Mutation con Callbacks por Componente
- Definir comportamiento global en el hook, comportamiento específico al llamar `mutate`
- Los callbacks del componente se ejecutan DESPUÉS de los del hook

```tsx
// ✅ CORRECT - Callbacks a dos niveles
// Hook (global)
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      logError('delete_user_failed', error);
    },
  });
}

// Componente (específico)
function UserRow({ user }: { user: User }) {
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    deleteUser.mutate(user.id, {
      // Se ejecuta DESPUÉS del onSuccess del hook
      onSuccess: () => {
        toast.success(`${user.name} eliminado`);
      },
    });
  };
}
```

### 12.2 Cancelación de Queries
- Usar `AbortSignal` para cancelar requests HTTP cuando la query se desmonta
- TanStack Query pasa `signal` automáticamente al `queryFn`

```tsx
// ❌ INCORRECT - Sin cancelación
export async function fetchUsers(filters: UserFilters): Promise<User[]> {
  const response = await fetch(`/api/users?${buildParams(filters)}`);
  return response.json();
}

// ✅ CORRECT - Con cancelación vía signal
export async function fetchUsers(
  filters: UserFilters,
  signal?: AbortSignal
): Promise<User[]> {
  const response = await fetch(`/api/users?${buildParams(filters)}`, { signal });
  if (!response.ok) throw new ApiError('Error fetching users', response.status);
  return response.json();
}

// En queryOptions
export const usersQueryOptions = (filters: UserFilters) =>
  queryOptions({
    queryKey: userKeys.list(filters),
    queryFn: ({ signal }) => fetchUsers(filters, signal),
  });
```

### 12.3 Query Polling (Refetch Periódico)
- Usar `refetchInterval` para polling periódico
- Pausar cuando la ventana no está enfocada

```tsx
// ✅ CORRECT - Polling para datos en tiempo real
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: fetchUnreadNotifications,
    refetchInterval: 30_000,                // Cada 30 segundos
    refetchIntervalInBackground: false,      // No pollear en background
  });
}

// ✅ CORRECT - Polling condicional
export function useJobStatus(jobId: string) {
  return useQuery({
    queryKey: ['jobs', jobId, 'status'],
    queryFn: () => fetchJobStatus(jobId),
    refetchInterval: (query) => {
      // Dejar de pollear cuando el job termine
      if (query.state.data?.status === 'completed') return false;
      if (query.state.data?.status === 'failed') return false;
      return 2000; // Cada 2 segundos mientras está en progreso
    },
  });
}
```

### 12.4 Axios/Fetch Interceptor con React Query
- Configurar un client HTTP base con interceptors
- Inyectar tokens, manejar refreshes de auth

```tsx
// ✅ CORRECT - Cliente HTTP con interceptor de auth
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado: intentar refresh
      try {
        await refreshToken();
        return apiClient.request(error.config);
      } catch {
        // Redirect a login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Uso en funciones de API
export const fetchUser = async (id: string): Promise<User> => {
  const { data } = await apiClient.get<User>(`/users/${id}`);
  return data;
};
```

---

## RESUMEN DE REGLAS CRÍTICAS

1. **SIEMPRE** usar un query key factory centralizado
2. **SIEMPRE** usar `queryOptions()` para definiciones reutilizables
3. **SIEMPRE** invalidar queries relacionadas después de mutations
4. **SIEMPRE** manejar los 3 estados: loading, error, success
5. **SIEMPRE** usar `AbortSignal` para cancelación en funciones de fetch
6. **SIEMPRE** verificar `response.ok` antes de parsear JSON
7. **NUNCA** usar `useEffect` + `useState` para data fetching — usar TanStack Query
8. **NUNCA** almacenar server state en estado local — dejar que Query lo maneje
9. **NUNCA** reintentar errores de validación (4xx) — solo errores de red/servidor
10. **NUNCA** crear optimistic updates para creación de entidades sin ID del servidor
11. **NUNCA** invalidar todo el cache — invalidar granularmente con query key hierarchy
12. **NUNCA** olvidar `placeholderData: keepPreviousData` en paginación