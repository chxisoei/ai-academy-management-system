import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Loader2, X } from 'lucide-react';
import { getStudents, addStudent, getClasses } from '../services/api';

const GET_PARENT_STRATEGY = {
  '분석형': {
    badgeColor: 'rgba(99, 102, 241, 0.1)',
    textColor: '#4F46E5',
    strategy: '수치·지표 중심 객관적 상담',
    tip: '정밀 데이터와 오답률 분석 결과를 함께 제시하세요.'
  },
  '격려형': {
    badgeColor: 'rgba(236, 72, 153, 0.1)',
    textColor: '#DB2777',
    strategy: '성장 지향적·긍정적 정서 교감',
    tip: '점수 자체보다 태도 개선과 노력한 점을 먼저 칭찬하세요.'
  },
  '결과중심형': {
    badgeColor: 'rgba(245, 158, 11, 0.1)',
    textColor: '#D97706',
    strategy: '핵심 결과 & 향후 액션플랜 제시',
    tip: '설명은 간결하게, 다음 시험의 구체적 목표 점수를 언급하세요.'
  },
  '참여형': {
    badgeColor: 'rgba(16, 185, 129, 0.1)',
    textColor: '#059669',
    strategy: '밀착형 피드백 & 가정 연계 소통',
    tip: '가정에서 지도해 주실 부분과 밀착 학습 관리를 공유하세요.'
  }
};

const ProfileDB = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '', // 학생 전화번호
    school: '',
    grade: '중1',
    goal: '성적향상',
    classId: '1', // 기본 가우스 반
    parentName: '', // 학부모 이름
    parentPhone: '', // 학부모 연락처
    parentRelationship: '모', // 부, 모, 기타 보호자
    parentType: '격려형',
    sensitivity: '보통'
  });

  const fetchStudents = async (query = '') => {
    setLoading(true);
    try {
      const data = await getStudents(query);
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (e) {
      console.error('Error fetching classes:', e);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(searchQuery);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchStudents(searchQuery);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.school) {
      alert('이름과 학교를 입력해주세요.');
      return;
    }
    
    setSaving(true);
    try {
      await addStudent({
        name: formData.name,
        phone: formData.phone || null,
        school: formData.school,
        grade: formData.grade,
        goal: formData.goal,
        classId: formData.classId,
        parentName: formData.parentName || null,
        parentPhone: formData.parentPhone || null,
        parentRelationship: formData.parentRelationship,
        parentType: formData.parentType,
        sensitivity: formData.sensitivity,
        "lastReport": new Date().toISOString().split('T')[0] // today
      });
      setIsModalOpen(false);
      setFormData({
        name: '',
        phone: '',
        school: '',
        grade: '중1',
        goal: '성적향상',
        classId: '1',
        parentName: '',
        parentPhone: '',
        parentRelationship: '모',
        parentType: '격려형',
        sensitivity: '보통'
      });
      // 목록 새로고침
      fetchStudents(searchQuery);
    } catch (error) {
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>학생 및 학부모 DB</h1>
          <p className="page-subtitle" style={{ margin: 0, marginTop: '0.25rem' }}>학생 개인별 맞춤 목표와 학부모 성향을 관리합니다.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> 신규 등록
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFCFF' }}>
          
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'student' ? 'active' : ''}`}
              onClick={() => setActiveTab('student')}
            >
              재원생 목록
            </div>
            <div 
              className={`tab ${activeTab === 'parent' ? 'active' : ''}`}
              onClick={() => setActiveTab('parent')}
            >
              학부모 목록
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="이름, 학교 검색" 
                className="input-field" 
                style={{ paddingLeft: '2.25rem', width: '240px', background: 'white' }} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.5rem', background: 'white' }} onClick={handleSearch}>
              <Filter size={18} />
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {activeTab === 'student' ? (
            <>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>학생 이름</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>학교/학년</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>학습 목표</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>학부모 성향</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>보고서 민감도</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>최근 보고서</th>
                  <th style={{ padding: '1.25rem 1.5rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map(student => (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                          {student.name ? student.name[0] : '?'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <span>{student.name}</span>
                            {student.classes?.name && (
                              <span style={{ 
                                fontSize: '0.6875rem', 
                                fontWeight: '600', 
                                color: student.classes.name === '가우스 반' ? '#4F46E5' : student.classes.name === '오일러 반' ? '#059669' : '#D97706',
                                background: student.classes.name === '가우스 반' ? 'rgba(99, 102, 241, 0.1)' : student.classes.name === '오일러 반' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                padding: '0.125rem 0.375rem', 
                                borderRadius: '4px' 
                              }}>
                                {student.classes.name}
                              </span>
                            )}
                          </div>
                          {student.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '2px' }}>{student.phone}</div>}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{student.school} {student.grade}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(55, 114, 255, 0.1)', color: 'var(--primary)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                          {student.goal}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{student.parents?.type || '-'}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ 
                          display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                          background: student.parents?.sensitivity === '높음' ? '#FEE2E2' : student.parents?.sensitivity === '보통' ? '#FEF3C7' : '#D1FAE5',
                          color: student.parents?.sensitivity === '높음' ? '#DC2626' : student.parents?.sensitivity === '보통' ? '#D97706' : '#059669'
                        }}>
                          {student.parents?.sensitivity || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{student.lastReport || '-'}</td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <button style={{ color: 'var(--text-muted)', padding: '0.25rem', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.background = '#E2E8F0'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}><MoreVertical size={18} /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      등록된 데이터가 없거나 검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </>
          ) : (
            <>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>학부모 대상 (자녀)</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>학부모 성향</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>민감도</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>맞춤 상담 전략</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>실전 소통 팁</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>최근 보고서 / 연락처</th>
                  <th style={{ padding: '1.25rem 1.5rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map(student => {
                    const strategy = GET_PARENT_STRATEGY[student.parents?.type] || {
                      badgeColor: '#F1F5F9',
                      textColor: '#64748B',
                      strategy: '기본 소통 전략',
                      tip: '학생의 전반적인 상황에 맞추어 상담을 진행해 주세요.'
                    };
                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#64748B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                            {student.parents?.name ? student.parents.name[0] : (student.name ? student.name[0] : '?')}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              {student.parents?.name ? (
                                <>
                                  <span>{student.parents.name}</span>
                                  <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: '#475569', background: '#F1F5F9', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
                                    {student.parents.relationship || '모'}
                                  </span>
                                </>
                              ) : (
                                student.parents?.relationship === '부' ? `${student.name} 아버님` :
                                student.parents?.relationship === '기타 보호자' ? `${student.name} 보호자` :
                                `${student.name} 어머님`
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '2px' }}>
                              {student.school} {student.grade} {student.name} 자녀 {student.classes?.name && `(${student.classes.name})`}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', background: '#F1F5F9', color: '#334155', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                            {student.parents?.type || '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <span style={{ 
                            display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                            background: student.parents?.sensitivity === '높음' ? '#FEE2E2' : student.parents?.sensitivity === '보통' ? '#FEF3C7' : '#D1FAE5',
                            color: student.parents?.sensitivity === '높음' ? '#DC2626' : student.parents?.sensitivity === '보통' ? '#D97706' : '#059669'
                          }}>
                            {student.parents?.sensitivity || '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem' }}>
                          <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: strategy.badgeColor, color: strategy.textColor, borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                            {strategy.strategy}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.8125rem', maxWidth: '280px', whiteSpace: 'normal', wordBreak: 'keep-all' }}>
                          {strategy.tip}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          <div>{student.lastReport || '-'}</div>
                          {student.parents?.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>☎ {student.parents.phone}</div>}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                          <button style={{ color: 'var(--text-muted)', padding: '0.25rem', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.background = '#E2E8F0'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}><MoreVertical size={18} /></button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      등록된 데이터가 없거나 검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </>
          )}
        </table>
        
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', background: '#FAFCFF' }}>
          <span>총 {students.length}명의 {activeTab === 'student' ? '학생' : '학부모'}이 검색되었습니다.</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', background: 'white' }}>이전</button>
            <button className="btn btn-primary" style={{ padding: '0.375rem 0.875rem' }}>1</button>
            <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', background: 'white' }}>다음</button>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>신규 학생 등록</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* 학생 정보 1: 이름 / 연락처 */}
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">이름 <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input type="text" name="name" className="input-field" value={formData.name} onChange={handleInputChange} required placeholder="홍길동" />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">학생 연락처</label>
                  <input type="text" name="phone" className="input-field" value={formData.phone} onChange={handleInputChange} placeholder="010-0000-0000" />
                </div>
              </div>

              {/* 학생 정보 2: 학교 / 학년 / 소속 반 */}
              <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">학교 <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input type="text" name="school" className="input-field" value={formData.school} onChange={handleInputChange} required placeholder="강남중" style={{ fontSize: '0.8125rem' }} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">학년</label>
                  <select name="grade" className="input-field" value={formData.grade} onChange={handleInputChange} style={{ fontSize: '0.8125rem' }}>
                    <option value="초6">초6</option>
                    <option value="중1">중1</option>
                    <option value="중2">중2</option>
                    <option value="중3">중3</option>
                    <option value="고1">고1</option>
                    <option value="고2">고2</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">소속 반</label>
                  <select name="classId" className="input-field" value={formData.classId} onChange={handleInputChange} style={{ fontSize: '0.8125rem' }}>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 학부모 정보 경계선 */}
              <div style={{ borderTop: '1px dashed var(--border)', margin: '1.25rem 0' }}></div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>학부모 정보 (선택)</div>

              {/* 학부모 정보 1: 보호자 구분 / 학부모 이름 / 학부모 연락처 */}
              <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">보호자 구분</label>
                  <select name="parentRelationship" className="input-field" value={formData.parentRelationship} onChange={handleInputChange} style={{ fontSize: '0.8125rem' }}>
                    <option value="모">모 (어머니)</option>
                    <option value="부">부 (아버지)</option>
                    <option value="기타 보호자">기타 보호자</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">학부모 이름</label>
                  <input type="text" name="parentName" className="input-field" value={formData.parentName} onChange={handleInputChange} placeholder="한지민" style={{ fontSize: '0.8125rem' }} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">학부모 연락처</label>
                  <input type="text" name="parentPhone" className="input-field" value={formData.parentPhone} onChange={handleInputChange} placeholder="010-0000-0000" style={{ fontSize: '0.8125rem' }} />
                </div>
              </div>

              {/* 학부모 정보 2: 학습 목표 / 학부모 성향 / 보고서 민감도 */}
              <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '2rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">학습 목표</label>
                  <select name="goal" className="input-field" value={formData.goal} onChange={handleInputChange} style={{ fontSize: '0.8125rem' }}>
                    <option value="성적향상">성적향상</option>
                    <option value="흥미유발">흥미유발</option>
                    <option value="선행진도">선행진도</option>
                    <option value="개념보완">개념보완</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">학부모 성향</label>
                  <select name="parentType" className="input-field" value={formData.parentType} onChange={handleInputChange} style={{ fontSize: '0.8125rem' }}>
                    <option value="분석형">분석형</option>
                    <option value="격려형">격려형</option>
                    <option value="결과중심형">결과중심형</option>
                    <option value="참여형">참여형</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">보고서 민감도</label>
                  <select name="sensitivity" className="input-field" value={formData.sensitivity} onChange={handleInputChange} style={{ fontSize: '0.8125rem' }}>
                    <option value="높음">높음</option>
                    <option value="보통">보통</option>
                    <option value="낮음">낮음</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>취소</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDB;
