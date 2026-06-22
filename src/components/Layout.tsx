import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Sprout, FlaskConical, ShoppingCart, Users, ClipboardCheck, Settings, Leaf } from 'lucide-react';

const navItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/seeds', label: '种子库存', icon: Sprout },
  { to: '/chemicals', label: '化肥农药', icon: FlaskConical },
  { to: '/sales', label: '销售出库', icon: ShoppingCart },
  { to: '/credit', label: '农户赊账', icon: Users },
  { to: '/registration', label: '实名登记', icon: ClipboardCheck },
  { to: '/settings', label: '系统设置', icon: Settings },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-surface-50">
      <aside className="w-60 bg-primary-600 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-primary-500">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gold-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-900" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide">农资管理系统</h1>
              <p className="text-xs text-primary-200 mt-0.5">AgriStore Pro</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-primary-500">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center text-sm font-bold">
              管
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">管理员</p>
              <p className="text-xs text-primary-200">在线</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
