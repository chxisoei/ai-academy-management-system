import React, { useState, useEffect } from 'react';
import { FileText, Send, Sparkles, Copy, MessageCircle, Loader2 } from 'lucide-react';
import { getStudents, getClasses } from '../services/api';
import { generateReportAI, hasGeminiConfig } from '../services/gemini';

const Report = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [examType, setExamType] = useState('학교 기말고사');
  const [currentScore, setCurrentScore] = useState(85);
  const [prevScore, setPrevScore] = useState(72);
  const [keywords, setKeywords] = useState('');
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsData, classesData] = await Promise.all([
          getStudents(),
          getClasses()
        ]);
        setStudents(studentsData);
        setClasses(classesData);
        if (studentsData.length > 0) {
          setSelectedStudent(String(studentsData[0].id));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    
    const newFiltered = classId === 'all'
      ? students
      : students.filter(s => String(s.class_id || s.classes?.id) === String(classId));
      
    if (newFiltered.length > 0) {
      setSelectedStudent(String(newFiltered[0].id));
    } else {
      setSelectedStudent('');
    }
  };

  const filteredStudents = selectedClass === 'all'
    ? students
    : students.filter(s => String(s.class_id || s.classes?.id) === String(selectedClass));

  const handleGenerate = async () => {
    if (!selectedStudent) {
      alert('학생을 선택해주세요.');
      return;
    }
    
    setGenerating(true);
    setReport('');
    
    const studentInfo = students.find(s => String(s.id) === String(selectedStudent));
    const name = studentInfo ? studentInfo.name : '학생';
    const goal = studentInfo ? studentInfo.goal : '성적향상';
    const className = studentInfo?.classes?.name || '';
    
    const parent = studentInfo?.parents || {};
    const rel = parent.relationship || '모';
    const parentTitle = rel === '부' ? '아버님' : rel === '모' ? '어머님' : '보호자님';
    const pType = parent.type || '격려형';
    
    const diff = currentScore - prevScore;
    let scoreComparison = '';
    if (diff > 0) {
      scoreComparison = `지난 평가 대비 성취도가 무려 ${diff}점이나 향상되어 아주 의미 있는 우수한 발전을 보여주었습니다.`;
    } else if (diff < 0) {
      scoreComparison = `직전 평가 점수 대비 소폭 아쉬운 변동이 있지만, 이번 분석을 통해 발견된 구체적인 약점들을 완벽히 보완할 수 있는 아주 소중한 기회입니다.`;
    } else {
      scoreComparison = `지난 평가와 동일한 점수를 유지하며 흔들림 없이 탄탄하고 안정적인 학습 완성도를 이어나가고 있습니다.`;
    }

    // Build a natural sentence from keywords to avoid robot-like template formatting
    const getNaturalKeywordSentence = (kws, type, sName) => {
      if (!kws) {
        if (type === '격려형') return `우리 ${sName}이는 평소에도 참 다정하고 성실하게 수업에 임해줍니다.`;
        if (type === '분석형') return `평소 학습 태도가 매우 차분하며 과제 수행률이 우수한 편입니다.`;
        if (type === '결과중심형') return `수업 집중도가 훌륭하고 성적 향상에 대한 의지가 뚜렷한 학생입니다.`;
        return `학습 성실도가 아주 모범적이며 적극적인 태도로 참여하고 있습니다.`;
      }
      // Clean up the user-entered keywords slightly to fit nicely into a human message
      return `평소 수업을 지도해 보면 우리 ${sName}이가 "${kws}" 모습들을 아주 예쁘게 보여주고 있습니다.`;
    };

    const keywordText = getNaturalKeywordSentence(keywords, pType, name);

    // If Gemini config is present, try real API call
    if (hasGeminiConfig) {
      try {
        const aiReport = await generateReportAI({
          studentName: name,
          school: studentInfo?.school || '학교',
          grade: studentInfo?.grade || '학년',
          className,
          examType,
          currentScore,
          prevScore,
          keywords,
          parentType: pType,
          relationship: rel
        });
        setReport(aiReport);
        setGenerating(false);
        return;
      } catch (error) {
        console.warn('Real AI report generation failed, falling back to mock simulator:', error);
      }
    }

    // Mock Fallback Simulator
    setTimeout(() => {
      setGenerating(false);
      
      let generatedContent = '';
      if (pType === '분석형') {
        generatedContent = `${parentTitle}, 안녕하세요. ${className ? className + ' ' : ''}${name}이 담당 수학 강사 김원장입니다.
이번에 실시한 ${examType} 정밀 분석 리포트를 전달해 드립니다.

[성적 및 성취 지표 분석]
- 이번 ${examType} 점수: ${currentScore}점
- 직전 평가 점수: ${prevScore}점 (${diff >= 0 ? '+' : ''}${diff}점 변동)
- 성취 분석: ${scoreComparison}

[세부 단원 및 약점 유형 진단]
${keywordText} ${name}이는 기본 개념의 완성도는 양호하나, 오답 분석 결과 도형을 응용한 다항식 연산 및 활용 유형에서 식 세우는 과정에 미세한 약점이 포착되었습니다. 제한된 시간 내 풀이하는 시간 분배 훈련이 핵심 과제입니다.

[향후 맞춤 처방 계획]
1. 취약 단원(이차방정식 활용) 기출 유사도 95% 이상 심화 문항 집중 풀이
2. 서술형 조건 누락 방지를 위한 감점 요인 추적 오답 노트 작성
3. 주 1회 타이머 연산 훈련을 통해 실전 시간 압박 극복

자세한 오답 정량 분석 표와 단원 처방지는 별도 인쇄물로도 송부해 드리겠습니다. 감사합니다!`;
      } else if (pType === '결과중심형') {
        generatedContent = `${parentTitle}, 안녕하세요. ${className ? className + ' ' : ''}${name}이 담당 강사 김원장입니다. 
${name}이의 이번 ${examType} 결과를 요약하여 공유해 드립니다.

[평가 결과 요약]
- 이번 시험 점수: ${currentScore}점 (직전 대비 ${diff >= 0 ? '▲' : '▼'}${Math.abs(diff)}점)
- 결과 요약: ${scoreComparison}

[향후 목표 및 실행 방안]
${keywordText} 이번 결과를 꼼꼼히 짚어보며 다음 시험을 완벽하게 대비하기 위해 확실한 단기적 보완 목표를 잡았습니다.
- 단기 목표: 고난도 서술형 감점 요소 완전 배제 및 95점 이상 달성
- 실천 과제: 주 2회 실전 동형 모의고사 풀이 및 단원별 취약 기출문제 3회독 진행

목표한 성과를 확실하게 달성할 수 있도록 빈틈없이 이끌겠습니다. 믿고 맡겨주셔서 감사합니다.`;
      } else if (pType === '참여형') {
        generatedContent = `${parentTitle}, 안녕하세요! ${className ? className + ' ' : ''}${name}이와 소통하며 지도하는 김원장입니다.
이번 ${examType} 성취 결과를 토대로, 학원과 가정이 연계하여 시너지를 낼 수 있는 학습 가이드를 드립니다.

- 이번 시험 점수: ${currentScore}점
- 평가 코멘트: ${scoreComparison}

${keywordText} 학원에서 관찰한 결과, ${name}이는 배운 내용을 소화하는 능력이 우수하므로 가정에서의 규칙적인 복습이 더해진다면 훨씬 빠른 성장이 가능합니다.
- [가정 연계 가이드]: 시험 오답 리스트를 별도 송부해 드리오니, 가정에서도 아이의 자기주도 학습 습관이 유지될 수 있도록 주 1회 가볍게 격려해주시길 부탁드립니다.
- [학원 피드백 채널]: 매주 월요일과 수요일에 개인별 완성도 메시지를 부모님께 적극적으로 공유하며 함께 발맞추어 나아가겠습니다.

궁금하신 점이 있으시면 언제든 편하게 연락해주세요!`;
      } else { // 격려형
        generatedContent = `${parentTitle}, 안녕하세요! 우리 ${className ? className + ' ' : ''}${name}이를 아끼고 정성껏 지도하는 김원장입니다. 
오늘 ${name}이가 정말 고생 많았던 ${examType}에 대한 보람찬 격려 소식을 전해드립니다.

- 이번 시험 점수: ${currentScore}점
- 노력의 성과: ${scoreComparison}

${keywordText} ${name}이는 이번 평가를 준비하며 단 한 번의 지각 없이 누구보다 진지한 태도로 성실하게 숙제와 식 쓰기 훈련에 임했습니다. 점수를 뛰어넘어 포기하지 않고 끝까지 성취하려 노력한 이 소중한 태도와 인성은 앞으로의 성장에 있어 가장 빛나는 자산이 될 것입니다.

비록 계산상의 사소한 실수로 조금 아쉽게 놓친 문항들이 있지만, "선생님 다음엔 다 맞출게요!"라며 환하게 웃는 ${name}이의 가능성을 믿고 격려해주세요. 
오늘 귀가하면 아이가 쏟은 노력에 대해 따뜻한 칭찬 한마디와 기분 좋은 눈맞춤을 꼭 부탁드립니다! 늘 감사드립니다.`;
      }
      
      setReport(generatedContent);
    }, 2000);
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    alert('보고서 내용이 클립보드에 복사되었습니다.');
  };

  return (
    <div>
      <h1 className="page-title">학부모 보고서 자동 생성</h1>
      <p className="page-subtitle">학생의 성적 추이와 학부모 성향을 반영한 맞춤형 카카오톡/문자 보고서를 10초 만에 생성합니다.</p>

      <div className="grid grid-cols-2-md-wrap gap-6">
        {/* Left: Input Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--primary)" /> 보고서 설정
          </h2>

          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">반 선택</label>
              {loading ? (
                <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '8px', background: 'white' }}>
                  <Loader2 className="animate-spin text-muted" size={20} />
                </div>
              ) : (
                <select className="input-field" value={selectedClass} onChange={e => handleClassChange(e.target.value)}>
                  <option value="all">전체 반</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">학생 선택</label>
              {loading ? (
                <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '8px', background: 'white' }}>
                  <Loader2 className="animate-spin text-muted" size={20} />
                </div>
              ) : (
                <select 
                  className="input-field" 
                  value={selectedStudent} 
                  onChange={e => setSelectedStudent(e.target.value)}
                  disabled={filteredStudents.length === 0}
                >
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.school} {s.grade}) - 성향: {s.parents?.type || '격려형'} ({s.parents?.relationship || '모'})
                      </option>
                    ))
                  ) : (
                    <option value="">이 반에 등록된 학생 없음</option>
                  )}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">시험 종류</label>
              <select className="input-field" value={examType} onChange={e => setExamType(e.target.value)} style={{ fontSize: '0.8125rem' }}>
                <option value="학교 중간고사">학교 중간고사</option>
                <option value="학교 기말고사">학교 기말고사</option>
                <option value="학원 월별평가">학원 월별평가</option>
                <option value="단원평가">단원평가</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">이번 점수</label>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-field" 
                value={currentScore} 
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setCurrentScore(val === '' ? '' : Math.min(100, Number(val)));
                }} 
                placeholder="85"
                style={{ fontSize: '0.8125rem' }} 
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">이전 점수</label>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-field" 
                value={prevScore} 
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setPrevScore(val === '' ? '' : Math.min(100, Number(val)));
                }} 
                placeholder="72"
                style={{ fontSize: '0.8125rem' }} 
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <label className="input-label">교사 추가 코멘트 키워드 (선택)</label>
            <textarea 
              className="input-field" 
              rows="3" 
              placeholder="예: 수업태도 좋음, 단순 계산 실수 아쉬움, 집에서 칭찬 요망"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
            ></textarea>
          </div>

          <button 
            className="btn btn-primary w-full" 
            style={{ padding: '0.875rem', fontSize: '1rem', fontWeight: '600' }}
            onClick={handleGenerate}
            disabled={generating || loading || !selectedStudent}
          >
            {generating ? (
              <><Sparkles size={20} className="animate-spin" /> AI가 학부모 성향에 맞춰 작성 중...</>
            ) : (
              <><Sparkles size={20} /> AI 보고서 생성하기</>
            )}
          </button>
        </div>

        {/* Right: Result */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            <MessageCircle size={20} color="var(--secondary)" /> 생성된 보고서
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              background: hasGeminiConfig ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              color: hasGeminiConfig ? '#059669' : '#4F46E5',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              marginLeft: 'auto'
            }}>
              {hasGeminiConfig ? '● Live Gemini AI' : '● Mock AI'}
            </span>
          </h2>

          <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            {generating ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Sparkles size={32} color="#CBD5E1" style={{ marginBottom: '1rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                <p style={{ fontWeight: '500' }}>데이터 분석 및 문구 다듬는 중...</p>
              </div>
            ) : report ? (
              <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#D97706', padding: '0.25rem 0.625rem', borderRadius: '6px', fontWeight: '600' }}>#학부모_맞춤</span>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(55, 114, 255, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.625rem', borderRadius: '6px', fontWeight: '600' }}>#성적향상_강조</span>
                  <span style={{ fontSize: '0.75rem', background: '#D1FAE5', color: '#059669', padding: '0.25rem 0.625rem', borderRadius: '6px', fontWeight: '600' }}>#긍정적_톤앤매너</span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '0.9375rem', color: 'var(--text-main)', flex: 1 }}>
                  {report}
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleCopy}>
                    <Copy size={18} /> 복사하기
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1, background: '#FEE500', color: '#000000', border: 'none' }} onMouseOver={e => e.currentTarget.style.opacity = '0.9'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                    <Send size={18} /> 카카오톡 전송
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                <FileText size={48} color="#E2E8F0" style={{ marginBottom: '1rem' }} />
                <p style={{ fontWeight: '500' }}>좌측에서 학생을 선택하고 생성 버튼을 누르면<br/>이곳에 보고서가 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
