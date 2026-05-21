import { supabase, hasSupabaseConfig } from '../lib/supabase';

// Mock Data Fallbacks
let MOCK_PARENTS = [
  { id: 1, name: '김진우', phone: '010-1234-5678', relationship: '부', type: '분석형', sensitivity: '보통' },
  { id: 2, name: '한지민', phone: '010-2345-6789', relationship: '모', type: '격려형', sensitivity: '낮음' },
  { id: 3, name: '박성호', phone: '010-3456-7890', relationship: '부', type: '결과중심형', sensitivity: '높음' },
  { id: 4, name: '최선영', phone: '010-4567-8901', relationship: '모', type: '분석형', sensitivity: '보통' },
  { id: 5, name: '정경화', phone: '010-5678-9012', relationship: '기타 보호자', type: '참여형', sensitivity: '낮음' },
];

const MOCK_CLASSES = [
  { id: 1, name: '가우스 반', description: '중등 심화 과정 및 대수 중심반' },
  { id: 2, name: '오일러 반', description: '고등 선행 및 기하/해석학 중심반' },
  { id: 3, name: '뉴턴 반', description: '기초 개념 정밀 보완 및 내신 대비반' },
];

let MOCK_STUDENTS = [
  { id: 1, name: '김민준', phone: '010-9876-5432', school: '강남중', grade: '중2', goal: '성적향상', parent_id: 1, class_id: 1, lastReport: '2026-04-30' },
  { id: 2, name: '이지은', phone: '010-8765-4321', school: '서초중', grade: '중1', goal: '흥미유발', parent_id: 2, class_id: 2, lastReport: '2026-05-02' },
  { id: 3, name: '박도윤', phone: '010-7654-3210', school: '역삼중', grade: '중3', goal: '선행진도', parent_id: 3, class_id: 1, lastReport: '2026-04-28' },
  { id: 4, name: '최유나', phone: '010-6543-2109', school: '대치중', grade: '중2', goal: '성적향상', parent_id: 4, class_id: 3, lastReport: '2026-05-15' },
  { id: 5, name: '정시우', phone: '010-5432-1098', school: '도곡중', grade: '중1', goal: '성적향상', parent_id: 5, class_id: 2, lastReport: '2026-05-10' },
];

const MOCK_ANALYSES = [
  { id: 1, name: '김민준', school: '강남중', test: '2026 1학기 중간고사', date: '방금 전', score: 85, weakness: '이차방정식 활용' },
  { id: 2, name: '이지은', school: '서초중', test: '2026 1학기 중간고사', date: '2시간 전', score: 72, weakness: '인수분해' },
  { id: 3, name: '박도윤', school: '역삼중', test: '2025 2학기 기말고사', date: '어제', score: 90, weakness: '계산 실수' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getMockStudentsData = async (searchQuery = '') => {
  await delay(600);
  let result = MOCK_STUDENTS.map(s => {
    const parent = MOCK_PARENTS.find(p => p.id === s.parent_id) || null;
    const cls = MOCK_CLASSES.find(c => c.id === s.class_id) || null;
    return { ...s, parents: parent, classes: cls };
  });

  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    result = result.filter(s => 
      s.name.toLowerCase().includes(lowerQuery) || 
      s.school.toLowerCase().includes(lowerQuery)
    );
  }
  return result.sort((a, b) => b.id - a.id);
};

const addMockStudentData = async (studentData) => {
  await delay(600);
  
  const parentId = Date.now() + 1;
  const newParent = {
    id: parentId,
    name: studentData.parentName || null,
    phone: studentData.parentPhone || null,
    relationship: studentData.parentRelationship || '모',
    type: studentData.parentType,
    sensitivity: studentData.sensitivity
  };
  MOCK_PARENTS.push(newParent);

  const newStudent = {
    id: Date.now(),
    name: studentData.name,
    phone: studentData.phone || null,
    school: studentData.school,
    grade: studentData.grade,
    goal: studentData.goal,
    parent_id: parentId,
    class_id: Number(studentData.classId) || 1,
    lastReport: studentData.lastReport || new Date().toISOString().split('T')[0]
  };
  MOCK_STUDENTS.push(newStudent);
  
  const cls = MOCK_CLASSES.find(c => c.id === newStudent.class_id) || null;
  return {
    ...newStudent,
    parents: newParent,
    classes: cls
  };
};

const getMockStudentById = async (id) => {
  await delay(300);
  const student = MOCK_STUDENTS.find(s => String(s.id) === String(id));
  if (!student) return null;
  const parent = MOCK_PARENTS.find(p => p.id === student.parent_id) || null;
  const cls = MOCK_CLASSES.find(c => c.id === student.class_id) || null;
  return { ...student, parents: parent, classes: cls };
};

export const getClasses = async () => {
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase.from('classes').select('*').order('id', { ascending: true });
      if (error) {
        console.warn('Error fetching classes from Supabase, falling back to mock data:', error);
        return MOCK_CLASSES;
      }
      return data;
    } catch (e) {
      console.warn('Supabase classes request failed, falling back to mock:', e);
      return MOCK_CLASSES;
    }
  }
  await delay(200);
  return MOCK_CLASSES;
};

export const getStudents = async (searchQuery = '') => {
  if (hasSupabaseConfig) {
    try {
      let query = supabase.from('students').select('*, parents:parent_id(*), classes:class_id(*)').order('created_at', { ascending: false });
      
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,school.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching students from Supabase, falling back to mock:', error);
        return getMockStudentsData(searchQuery);
      }
      return data;
    } catch (e) {
      console.warn('Supabase students request failed, falling back to mock:', e);
      return getMockStudentsData(searchQuery);
    }
  }
  return getMockStudentsData(searchQuery);
};

export const addStudent = async (studentData) => {
  if (hasSupabaseConfig) {
    try {
      // 1. Insert parent first
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .insert([{
          name: studentData.parentName || null,
          phone: studentData.parentPhone || null,
          relationship: studentData.parentRelationship || '모',
          type: studentData.parentType,
          sensitivity: studentData.sensitivity
        }])
        .select()
        .single();
        
      if (parentError) {
        console.error('Error inserting parent:', parentError);
        throw parentError;
      }

      // 2. Insert student referencing parent_id and class_id
      const { data: studentRecords, error: studentError } = await supabase
        .from('students')
        .insert([{
          name: studentData.name,
          phone: studentData.phone || null,
          school: studentData.school,
          grade: studentData.grade,
          goal: studentData.goal,
          parent_id: parentData ? parentData.id : null,
          class_id: Number(studentData.classId) || null,
          lastReport: studentData.lastReport || new Date().toISOString().split('T')[0]
        }])
        .select();
        
      if (studentError) {
        console.error('Error inserting student:', studentError);
        throw studentError;
      }
      
      // Fetch class relation
      let classRecord = null;
      if (studentRecords[0].class_id) {
        const { data: clsData } = await supabase
          .from('classes')
          .select('*')
          .eq('id', studentRecords[0].class_id)
          .single();
        classRecord = clsData;
      }
      
      return {
        ...studentRecords[0],
        parents: parentData,
        classes: classRecord
      };
    } catch (e) {
      console.warn('Supabase insert student failed, falling back to mock:', e);
      return addMockStudentData(studentData);
    }
  }
  return addMockStudentData(studentData);
};

export const getRecentAnalyses = async () => {
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase.from('analyses').select('*, students:student_id(*)').order('created_at', { ascending: false }).limit(3);
      if (error) {
        console.warn('Error fetching analyses from Supabase, falling back to mock:', error);
        return MOCK_ANALYSES;
      }
      return data;
    } catch (e) {
      console.warn('Supabase analyses request failed, falling back to mock:', e);
      return MOCK_ANALYSES;
    }
  }
  await delay(500);
  return MOCK_ANALYSES;
};

export const getStudentById = async (id) => {
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase.from('students').select('*, parents:parent_id(*), classes:class_id(*)').eq('id', id).single();
      if (error) {
        console.warn('Error fetching student from Supabase, falling back to mock:', error);
        return getMockStudentById(id);
      }
      return data;
    } catch (e) {
      console.warn('Supabase studentById request failed, falling back to mock:', e);
      return getMockStudentById(id);
    }
  }
  return getMockStudentById(id);
};
