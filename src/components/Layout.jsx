import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FileSearch, FileText, Settings, Bell, Search, Plus, CheckCircle, FileCheck } from 'lucide-react';

const Layout = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifRef, profileRef]);

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 4px 12px rgba(55, 114, 255, 0.35))' }}>
              {/* Elegant Cursive m + y connected path */}
              <path d="M 18,48 L 18,36 C 18,22 36,22 36,36 L 36,45 M 36,36 C 36,18 54,18 54,36 L 54,48 C 54,60 82,60 82,34" stroke="var(--primary)" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 82,28 L 82,66 C 82,82 52,82 52,70" stroke="var(--primary)" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
          <div className="header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.03em', fontFamily: "'Outfit', 'Inter', sans-serif" }}>mydemy</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', background: 'rgba(55, 114, 255, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px', letterSpacing: '0.05em' }}>AI</span>
            </div>
          </div>

          <div className="header-right">
            <div className="search-bar-responsive">
              <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="학생 이름 검색..."
                style={{ background: 'transparent', border: 'none', outline: 'none', marginLeft: '0.5rem', width: '100%', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                style={{
                  position: 'relative',
                  color: isNotifOpen ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  background: isNotifOpen ? 'rgba(55, 114, 255, 0.1)' : 'transparent',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
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

            <div style={{ position: 'relative' }} ref={profileRef}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img src="https://ui-avatars.com/api/?name=M&background=3772FF&color=fff&rounded=true" alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
              </div>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="card animate-fade-in" style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '240px',
                  padding: '1.25rem',
                  zIndex: 50,
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>김태현 원장님</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>마이데미 AI 학원</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>직책:</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>원장 / 대표 강사</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>아이디:</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>mydemy_head</span>
                    </div>
                  </div>
                </div>
              )}
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
