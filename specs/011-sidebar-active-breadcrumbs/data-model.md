# Data Model & Structs: Active Sidebar & Aligned Breadcrumbs

## Route Metadata Structure (`RouteMeta`)

We extend the Vue Router `meta` field options with the following TypeScript properties to support dynamic sidebar highlighting and automatic breadcrumb path generation.

### Interface: `RouteMeta`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `roles` | `string[]` | Yes | List of user roles allowed to access this route (existing). |
| `activeMenu` | `string` | No | The path (`item.to` value) of the parent sidebar item that should remain active when this route is visited. |
| `title` | `string` | No | The plain text display title of this page, used as the leaf node in the breadcrumb path. |

### Example Router Definitions

```typescript
// Parent Route
{
  path: '/bpdp/antrean',
  name: 'bpdp-antrean',
  component: () => import('@/views/bpdp/AntreanBpdpView.vue'),
  meta: { roles: ['BPDPKS', 'BPDP_VERIFIKATOR', 'BPDP_APPROVAL'], title: 'Antrean Verifikasi Kelayakan' }
}

// Child Detail Route
{
  path: '/bpdp/ceki/:id',
  name: 'bpdp-ceki',
  component: () => import('@/views/bpdp/CekiBpdpView.vue'),
  meta: {
    roles: ['BPDP_VERIFIKATOR'],
    activeMenu: '/bpdp/antrean',
    title: 'Penilaian Kelayakan'
  }
}
```

---

## Navigation Item & Section Structure

The structured format for navigation items, shared between `Sidebar.vue` and `Breadcrumb.vue` through the `useNavigation` composable.

### Interface: `NavItem`

| Field | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | The text displayed in the sidebar menu item. |
| `to` | `string` | The Vue Router target path. |
| `icon` | `Component` | The Lucide icon component to display next to the label. |

### Interface: `NavSection`

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | The header title for the navigation section. |
| `role` | `string \| string[]` | The user roles allowed to see this section (or `'ALL'`). |
| `items` | `NavItem[]` | List of items belonging to this section. |
