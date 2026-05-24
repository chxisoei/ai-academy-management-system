// src/services/gemini.js

export const hasGeminiConfig = !!import.meta.env.VITE_GEMINI_API_KEY;
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Generates a tailored parent feedback report utilizing Google Gemini 1.5 Flash.
 */
export const generateReportAI = async ({
  studentName,
  school,
  grade,
  className,
  examType,
  currentScore,
  prevScore,
  keywords,
  parentType,
  relationship
}) => {
  if (!hasGeminiConfig) {
    throw new Error('Gemini API key is not configured.');
  }

  const parentTitle = relationship === '부' ? '아버님' : relationship === '모' ? '어머님' : '보호자님';
  const diff = currentScore - prevScore;
  let scoreText = '';
  if (diff > 0) {
    scoreText = `지난 평가 대비 성취도가 ${diff}점 향상됨`;
  } else if (diff < 0) {
    scoreText = `직전 평가 점수 대비 ${Math.abs(diff)}점 하락함`;
  } else {
    scoreText = `지난 평가와 동일한 ${currentScore}점을 유지함`;
  }

  const classText = className ? `${className}` : '학원 수학반';

  // ✅ 키워드를 자연스럽게 녹이도록 지시 강화
  const keywordInstruction = keywords
    ? `교사가 학생을 직접 곁에서 관찰한 내용 (아래 원문을 절대 그대로 쓰지 말 것. 10년차 베테랑 선생님이 학부모께 직접 말하듯, 따뜻하고 자연스러운 문장 속에 완전히 녹여낼 것): "${keywords}"`
    : '교사 관찰 내용: 없음';

  const systemInstruction = `
당신은 대한민국 최고의 수학 전문 학원인 'AI 아카데미'의 원장 강사 김원장입니다.
다음 학생 및 학부모 정보를 바탕으로, 해당 학부모의 성향(Type)에 완벽하게 맞춤화된 전문적이고 신뢰감 높은 피드백 카카오톡/문자 보고서 문구를 작성해 주세요.

[학부모 성향별 작성 가이드라인 (반드시 준수)]
1. '분석형' (Analytical):
   - 매우 전문적이고 객관적인 어조를 유지하세요.
   - [성적 및 성취 지표 분석], [세부 단원 및 약점 유형 진단], [향후 맞춤 처방 계획] 세 가지 핵심 영역으로 구분하여 수치와 구체적 단원명을 제시하세요.
   - 감정적 위로보다는 냉철한 오답 요인 분석과 정량적인 해결 지표를 제안하세요.

2. '격려형' (Encouraging):
   - 매우 따뜻하고 다정하며 진심 어린 격려의 톤앤매너로 작성하세요.
   - 점수 자체보다는 아이가 보인 학습 태도, 성실성, 출결, 수업 태도를 먼저 크게 칭찬해 주세요.
   - "점수를 넘어 포기하지 않은 태도와 인성이 훌륭한 자산"임을 언급하며, 가정에서도 아이에게 폭풍 칭찬과 따뜻한 포옹을 건넬 것을 당부해 주세요.

3. '결과중심형' (Result-Oriented):
   - 매우 간결하고 군더더기 없이 요점만 작성하세요. (바쁜 학부모용)
   - 결과 요약과 함께, 다음 시험의 구체적이고 현실적인 목표 점수 및 확실하게 이룰 수 있는 2~3가지 초집중 액션 플랜을 직관적으로 제시하세요.
   - 설명은 줄이고 확신에 찬 어조로 결과 지향적인 피드백을 전달해 주세요.

4. '참여형' (Participatory):
   - 친근하고 협력적인 소통 어조를 유지하세요.
   - "학원과 가정이 연계하여 시너지를 내야 함"을 강력히 강조하고, 가정에서 부모님이 실천할 수 있는 [가정 연계 가이드](예: 주 1회 오답 점검 시 칭찬 등)와 학원의 밀착 피드백 일정을 제시해 주세요.
   - 학원의 소통 창구가 늘 열려있음을 전달해 주세요.

[공통 제약 사항 - AI 어조 완전 배제 (매우 중요)]
1. AI가 자동 생성한 느낌을 주는 기계적인 템플릿 어투나 메타적인 소개 멘트를 절대 사용하지 마세요.
   - (금지 표현): "선생님 의견인 '...' 사항을 반영하여", "~를 토대로 다음 시험의 구체적 목표와 액션플랜을 설정하였습니다", "제공해주신 키워드를 기반으로", "학부모님 성향을 고려하여" 등 AI가 프롬프트 데이터를 읽고 가공했음을 드러내는 메타적인 표현은 절대 금지합니다.

2. 교사 관찰 키워드 처리 규칙 (가장 중요):
   - 입력받은 키워드를 절대 원문 그대로 문장에 삽입하지 마세요.
   - 반드시 10년차 베테랑 담임 선생님이 학생을 곁에서 지켜본 것처럼 완전히 새로운 자연스러운 문장으로 재창작하여 녹여야 합니다.
   - ❌ 금지 예시: "'성적 향상됨, 칭찬 요망, 태도 성실' 모습을 보여주고 있습니다"
   - ❌ 금지 예시: "선생님 의견인 '성실함, 태도 좋음'을 반영하여"
   - ✅ 올바른 예시: "수업 시간마다 끝까지 자리를 지키며 집중하는 모습이 참 인상적이었고, 과제 하나도 허투루 넘기지 않는 꼼꼼함이 이번 결과로 고스란히 이어진 것 같아 담당 강사로서 정말 뿌듯했습니다."

3. 대치동의 실력 있고 학생들에게 다정한 10년 차 베테랑 담임 선생님이 학부모님께 직접 손편지를 쓰듯 정감 있고 신뢰를 주는 실제 구어체 톤앤매너로 작성하세요.
4. 보고서는 공손하고 정중한 한국어 존댓말(높임말)로 작성해 주세요.
5. 마크다운 코드 블록 형식(\`\`\`)은 절대로 사용하지 말고 바로 복사해서 붙여넣을 수 있는 줄바꿈 텍스트로만 응답해 주세요.
6. 별표를 사용하는 볼드 처리용 마크다운 문법(예: **텍스트**)을 포함한 모든 마크다운 서식 기호(##, *, ** 등)를 절대로 사용하지 마세요. 강조가 필요하다면 대괄호([대괄호])나 큰따옴표("따옴표")를 사용하여 평문 텍스트로 강조해 주세요.
`;

  const prompt = `
[정보 입력]
- 학생 이름: ${studentName} (소속: ${classText}, ${school} ${grade})
- 학부모 호칭: ${parentTitle} (성향: ${parentType})
- 평가 종류: ${examType}
- 이번 점수: ${currentScore}점
- 직전 점수: ${prevScore}점 (점수 변동: ${scoreText})
- ${keywordInstruction}

위 정보를 바탕으로, 해당 학부모 성향(${parentType})에 완벽히 타겟팅된 카카오톡/문자용 맞춤 보고서 피드백 문장을 작성해 주세요.
키워드는 절대 원문 그대로 쓰지 말고, 선생님이 직접 관찰한 것처럼 자연스러운 문장 속에 완전히 녹여주세요.
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemInstruction + '\n\n' + prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.9, // ✅ 0.7 → 0.9 으로 올려서 더 자연스러운 문체 유도
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up any remaining markdown blocks or bold/italic markers just in case
    text = text.replace(/```[a-zA-Z]*\n/g, '').replace(/```/g, '');
    text = text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
    return text;
  } catch (error) {
    console.error('Error in generateReportAI:', error);
    throw error;
  }
};

/**
 * Direct fetch call to Gemini 1.5 Flash to perform multimodal math exam sheet grading,
 * weak concept diagnosis, and structured practice problem recommendations.
 */
export const analyzeExamImageAI = async (base64Data, mimeType, studentInfo) => {
  if (!hasGeminiConfig) {
    throw new Error('Gemini API key is not configured.');
  }

  const studentName = studentInfo?.name || '학생';
  const school = studentInfo?.school || '해당 학교';
  const grade = studentInfo?.grade || '중등';
  const className = studentInfo?.classes?.name || '가우스 반';

  const prompt = `
당신은 최고 수준의 수학 교육용 AI 진단 엔진 및 대치동 일타 강사입니다.
전달된 이미지(수학 시험지 혹은 오답 이미지)를 읽고, 정밀 분석을 실시해 주세요.

학생 정보:
- 이름: ${studentName}
- 학교 및 학년: ${school} ${grade}
- 소속 반: ${className}

분석 결과를 바탕으로 아래 명시된 구조에 완전히 부합하는 JSON 데이터를 응답해 주세요.
반드시 정확한 JSON 스키마를 만족해야 하며, 다른 여분의 설명 문장이나 markdown 코드블록 기호(예: \`\`\`json) 없이 오직 JSON 자체만 반환해 주세요.

[원하는 JSON 구조 예시]
{
  "estimatedScore": 82,
  "errorCount": 3,
  "analysisSummary": "학생의 시험지 이미지 분석 결과, 개념 이해도는 대체로 탄탄하나 도형과 다항식의 복합적인 연산 응용 유형에서 특정 조건(길이 양수 조건 등)을 놓쳐 식을 끝까지 해결하지 못하고 있습니다.",
  "errors": [
    "단순 계산 실수: 8번 (인수분해 연산 중 부호 혼동)",
    "개념 이해 부족: 15번 (이차방정식 근의 공식을 이용한 도형 활용에 어려움)",
    "서술형 감점: 21번 (서술형 과정에서 풀이 전개 논리가 다소 비약됨)"
  ],
  "weaknessTags": ["도형의 활용", "다항식 연산 실수", "서술형 풀이"],
  "teacherComment": "${studentName}이는 기초가 튼튼하여 응용력이 뛰어나지만, 오답 패턴을 분석해 보니 조건이 복잡해지는 기하 융합 단원에서 계산 마무리에 불안정한 모습을 보입니다. 특히 ${school} 기출 경향상 변별력을 기르는 킬러 문항이 이 부분에서 잘 나오기 때문에 확실히 보강해야 합니다.",
  "recommendedQuestions": [
    {
      "num": 1,
      "title": "이차방정식을 활용한 도형의 넓이 최댓값 구하기 (심화)",
      "source": "2025 ${school} 기출 유사 변형",
      "type": "개념 보완",
      "accuracy": "유사도 97%"
    },
    {
      "num": 2,
      "title": "다항식의 전개와 곱셈 공식 응용",
      "source": "지역 학군 최다 오답 유사 기출",
      "type": "실수 방지",
      "accuracy": "유사도 94%"
    },
    {
      "num": 3,
      "title": "이차함수의 기하학적 성질 활용 (서술형 모의)",
      "source": "단원평가 고난도 문항 엄선",
      "type": "서술형 대비",
      "accuracy": "유사도 91%"
    }
  ]
}

주의사항:
- JSON 내부의 텍스트와 추천 문제는 실제로 업로드된 이미지 속 문항들의 특성(수학 방정식, 도형, 함수 등)을 적절히 반영하여 대치동 전문 강사가 작성한 것처럼 고품질로 자연스럽게 한글로 적어주세요.
- 만약 이미지 분석 결과가 완벽하게 식별하기 어렵다면, 학생 정보(${studentName}, ${school}, ${className})를 유기적으로 조합하여 사실적인 수학 오답 진단 결과와 3개의 대치동 스타일 맞춤 기출 변형 문제를 상상해서 생성해 주시면 됩니다.
- 절대 JSON 문법이 깨져서는 안 되며 따옴표와 쉼표를 정확하게 지켜주세요.
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the JSON safely with robust markdown block stripping
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/i, '').replace(/```$/i, '').trim();
    }
    
    const parsedData = JSON.parse(cleanText);
    return parsedData;
  } catch (error) {
    console.error('Error in analyzeExamImageAI:', error);
    throw error;
  }
};