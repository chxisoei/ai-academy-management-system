import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FileSearch, FileText, Settings, Bell, Search, Plus, CheckCircle, FileCheck } from 'lucide-react';

const Layout = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifRef]);

  const mockNotifications = [
    { id: 1, title: '김민준 학생 시험지 분석 완료', time: '방금 전', type: 'analysis', read: false },
    { id: 2, title: '새로운 기출문제가 업데이트되었습니다.', time: '2시간 전', type: 'system', read: false },
    { id: 3, title: '이번 달 미작성 보고서가 12건 있습니다.', time: '어제', type: 'report', read: true }
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={24} />
          </div>
        </div>

        <nav style={{ flex: 1, marginTop: '1rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} title="대시보드">
            <LayoutDashboard size={22} />
            <span>대시보드</span>
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} title="학생/학부모 DB">
            <Users size={22} />
            <span>학생/학부모 DB</span>
          </NavLink>
          <NavLink to="/analysis" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} title="시험지 분석 및 추천">
            <FileSearch size={22} />
            <span>시험지 분석 및 추천</span>
          </NavLink>
          <NavLink to="/report" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} title="학부모 보고서 생성">
            <FileText size={22} />
            <span>학부모 보고서 생성</span>
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button className="nav-link" title="설정">
            <Settings size={22} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
              에이마스터 AI
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
              새 분석 시작 +
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', padding: '0.625rem 1rem', borderRadius: '12px', width: '260px', border: '1px solid var(--border)' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="학생 이름 검색..."
                style={{ background: 'transparent', border: 'none', outline: 'none', marginLeft: '0.5rem', width: '100%', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                style={{
                  position: 'relative',
                  color: isNotifOpen ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  background: isNotifOpen ? 'rgba(55, 114, 255, 0.1)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <Bell size={20} />
                <span style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%', border: '2px solid white' }}></span>
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="card animate-fade-in" style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  padding: '0',
                  zIndex: 50,
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>알림</h3>
                    <button style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '500' }}>모두 읽음 처리</button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {mockNotifications.map(notif => (
                      <div key={notif.id} style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--border)',
                        background: notif.read ? 'white' : '#FAFCFF',
                        display: 'flex',
                        gap: '0.75rem',
                        cursor: 'pointer'
                      }} className="hover:bg-gray-50">
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          background: notif.type === 'analysis' ? 'rgba(55, 114, 255, 0.1)' : notif.type === 'report' ? '#FEF3C7' : '#E2E8F0',
                          color: notif.type === 'analysis' ? 'var(--primary)' : notif.type === 'report' ? '#D97706' : '#64748B',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {notif.type === 'analysis' ? <FileCheck size={16} /> : notif.type === 'report' ? <FileText size={16} /> : <Bell size={16} />}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: notif.read ? '500' : '600', marginBottom: '0.25rem', lineHeight: '1.4' }}>
                            {notif.title}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                    <button style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '500' }}>모든 알림 보기</button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <img src="https://ui-avatars.com/api/?name=W&background=3772FF&color=fff&rounded=true" alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            </div>
          </div>
        </header>

        <div className="page-container animate-fade-in" style={{ overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
