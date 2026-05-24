import React, { useState, useEffect } from 'react';
import { Users, FileCheck, Target, TrendingUp, ChevronRight, Clock, Loader2, X, AlertCircle } from 'lucide-react';
import { getRecentAnalyses, getStudents } from '../services/api';

const Dashboard = () => {
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Modal state for detailed analysis view
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [analyses, students] = await Promise.all([
          getRecentAnalyses(),
          getStudents()
        ]);
        setRecentAnalyses(analyses);
        setTotalStudents(students.length);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <h1 className="page-title">대시보드</h1>
      <p className="page-subtitle">오늘 학원의 주요 현황을 한눈에 확인하세요.</p>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2.5rem' }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(55, 114, 255, 0.1)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>총 재원생</h3>
            <p>{loading ? '...' : `${totalStudents}명`}</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#D1FAE5', color: '#10B981' }}>
            <FileCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>이번 달 분석 완료</h3>
            <p>42건</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#F59E0B' }}>
            <Target size={24} />
          </div>
          <div className="stat-info">
            <h3>맞춤 문제 제공</h3>
            <p>356문항</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#FCE7F3', color: '#EC4899' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>평균 성취도 향상</h3>
            <p>+12%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card col-span-2-lg">
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>최근 분석된 시험지</h2>
            <button style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              전체 보기 <ChevronRight size={16} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : recentAnalyses.length > 0 ? (
              recentAnalyses.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '200px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--primary)', flexShrink: 0 }}>
                      {item.name ? item.name[0] : 'S'}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{item.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'normal' }}>({item.school || '학교미상'})</span></h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{item.test || '기출고사'}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', flexGrow: 1 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.125rem', fontWeight: '500' }}>발견된 약점</p>
                      <span style={{ display: 'inline-block', padding: '0.125rem 0.625rem', background: '#FEE2E2', color: '#DC2626', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {item.weakness || '특이사항 없음'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '60px' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.125rem', fontWeight: '500' }}>점수</p>
                      <p style={{ fontWeight: '700', color: 'var(--text-main)' }}>{item.score || 0}점</p>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.375rem 0.75rem' }}
                      onClick={() => setSelectedAnalysis(item)}
                    >
                      상세 보기
                    </button>
                  </div>
                </div>
              ))
            ) : (
               <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>최근 분석된 시험지가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>할 일 및 알림</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#FFFBEB', borderRadius: '12px', border: '1px solid #FEF3C7' }}>
              <h4 style={{ fontWeight: '600', fontSize: '0.875rem', color: '#B45309', marginBottom: '0.25rem' }}>학부모 보고서 작성 필요</h4>
              <p style={{ fontSize: '0.8125rem', color: '#92400E', marginBottom: '0.5rem' }}>이번 달 미작성 보고서가 12건 있습니다.</p>
              <button style={{ fontSize: '0.75rem', fontWeight: '600', color: '#D97706' }}>바로 가기 &rarr;</button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', padding: '0.5rem' }}>
              <Clock size={16} color="var(--primary)" style={{ marginTop: '0.125rem' }} />
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>신규 기출문제 업데이트</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>강남중학교 2025년 기출이 DB에 추가되었습니다.</p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.375rem' }}>오늘 오전 10:30</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card animate-fade-in responsive-modal-content" style={{ width: '100%', maxWidth: '600px', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFCFF' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck size={20} color="var(--primary)" /> 분석 상세 결과
              </h2>
              <button onClick={() => setSelectedAnalysis(null)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(55, 114, 255, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.5rem' }}>
                    {selectedAnalysis.name ? selectedAnalysis.name[0] : 'S'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{selectedAnalysis.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{selectedAnalysis.school} • {selectedAnalysis.test}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>종합 점수</p>
                  <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', lineHeight: 1 }}>{selectedAnalysis.score}</span><span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>점</span>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-main)' }}>발견된 주요 오답 패턴</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <AlertCircle size={18} color="var(--error)" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9375rem', lineHeight: '1.5' }}><strong>{selectedAnalysis.weakness}</strong> (집중 보완 필요)</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <AlertCircle size={18} color="var(--warning)" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9375rem', lineHeight: '1.5' }}><strong>시간 안배 부족:</strong> 후반부 서술형 문제 공란 (추정)</span>
                  </li>
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedAnalysis(null)}>닫기</button>
                <button className="btn btn-primary" onClick={() => { setSelectedAnalysis(null); window.location.href='/analysis'; }}>
                  맞춤 문제 생성하러 가기 &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
