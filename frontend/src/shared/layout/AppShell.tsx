import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import styles from './AppShell.module.css';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />
      <div className={styles.body}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
