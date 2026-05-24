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
      // 1. Get max parent id to bypass sequence mismatch (Supabase identity desync)
      let nextParentId = undefined;
      const { data: maxParentData } = await supabase
        .from('parents')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      if (maxParentData && maxParentData.length > 0) {
        nextParentId = maxParentData[0].id + 1;
      }

      // Insert parent first referencing manual id if calculated
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .insert([{
          ...(nextParentId ? { id: nextParentId } : {}),
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

      // 2. Get max student id to bypass sequence mismatch
      let nextStudentId = undefined;
      const { data: maxStudentData } = await supabase
        .from('students')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      if (maxStudentData && maxStudentData.length > 0) {
        nextStudentId = maxStudentData[0].id + 1;
      }

      // Insert student referencing manual id and parent_id
      const { data: studentRecords, error: studentError } = await supabase
        .from('students')
        .insert([{
          ...(nextStudentId ? { id: nextStudentId } : {}),
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
      if (studentRecords && studentRecords.length > 0 && studentRecords[0].class_id) {
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
      console.error('Supabase insert student failed:', e);
      throw e;
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
      return data.map(item => ({
        ...item,
        name: item.students?.name || '학생',
        school: item.school || item.students?.school || '학교미상'
      }));
    } catch (e) {
      console.warn('Supabase analyses request failed, falling back to mock:', e);
      return MOCK_ANALYSES;
    }
  }
  await delay(500);
  return MOCK_ANALYSES;
};

export const addAnalysis = async (analysisData) => {
  if (hasSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .insert([{
          student_id: Number(analysisData.student_id),
          school: analysisData.school,
          test: analysisData.test,
          date: analysisData.date || new Date().toISOString().split('T')[0],
          score: Number(analysisData.score),
          weakness: analysisData.weakness
        }])
        .select();
        
      if (error) {
        console.error('Error inserting analysis into Supabase:', error);
        throw error;
      }
      return data[0];
    } catch (e) {
      console.error('Supabase insert analysis failed:', e);
      throw e;
    }
  }
  // Mock Fallback
  await delay(300);
  const newAnalysis = {
    id: Date.now(),
    student_id: Number(analysisData.student_id),
    name: '학생',
    school: analysisData.school,
    test: analysisData.test,
    date: analysisData.date || new Date().toISOString().split('T')[0],
    score: Number(analysisData.score),
    weakness: analysisData.weakness
  };
  
  const mockStudent = MOCK_STUDENTS.find(s => String(s.id) === String(analysisData.student_id));
  if (mockStudent) {
    newAnalysis.name = mockStudent.name;
  }
  
  MOCK_ANALYSES.unshift(newAnalysis);
  return newAnalysis;
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

// 학생 & 학부모 수정 API
export const updateStudent = async (id, studentData) => {
  if (hasSupabaseConfig) {
    try {
      // 1. 수정할 학생의 parent_id를 먼저 확보
      const { data: currentStudent, error: fetchError } = await supabase
        .from('students')
        .select('parent_id')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      const parentId = currentStudent?.parent_id;

      // 2. 학부모 정보 업데이트 (parent_id가 있을 경우에만)
      let parentData = null;
      if (parentId) {
        const { data: updatedParent, error: parentError } = await supabase
          .from('parents')
          .update({
            name: studentData.parentName || null,
            phone: studentData.parentPhone || null,
            relationship: studentData.parentRelationship || '모',
            type: studentData.parentType,
            sensitivity: studentData.sensitivity
          })
          .eq('id', parentId)
          .select()
          .single();
          
        if (parentError) throw parentError;
        parentData = updatedParent;
      }

      // 3. 학생 정보 업데이트
      const { data: updatedStudents, error: studentError } = await supabase
        .from('students')
        .update({
          name: studentData.name,
          phone: studentData.phone || null,
          school: studentData.school,
          grade: studentData.grade,
          goal: studentData.goal,
          class_id: Number(studentData.classId) || null
        })
        .eq('id', id)
        .select();
        
      if (studentError) throw studentError;
      
      // 4. 반 정보 매핑 조회
      let classRecord = null;
      if (updatedStudents && updatedStudents.length > 0 && updatedStudents[0].class_id) {
        const { data: clsData } = await supabase
          .from('classes')
          .select('*')
          .eq('id', updatedStudents[0].class_id)
          .single();
        classRecord = clsData;
      }

      return {
        ...updatedStudents[0],
        parents: parentData,
        classes: classRecord
      };
    } catch (e) {
      console.error('Supabase update student failed:', e);
      throw e;
    }
  }

  // --- Mock Fallback ---
  await delay(400);
  const studentIndex = MOCK_STUDENTS.findIndex(s => String(s.id) === String(id));
  if (studentIndex === -1) throw new Error('Student not found in mock');

  const student = MOCK_STUDENTS[studentIndex];
  
  // Mock Parent 업데이트
  let updatedParent = null;
  if (student.parent_id) {
    const parentIndex = MOCK_PARENTS.findIndex(p => p.id === student.parent_id);
    if (parentIndex !== -1) {
      MOCK_PARENTS[parentIndex] = {
        ...MOCK_PARENTS[parentIndex],
        name: studentData.parentName || null,
        phone: studentData.parentPhone || null,
        relationship: studentData.parentRelationship || '모',
        type: studentData.parentType,
        sensitivity: studentData.sensitivity
      };
      updatedParent = MOCK_PARENTS[parentIndex];
    }
  }

  // Mock Student 업데이트
  MOCK_STUDENTS[studentIndex] = {
    ...student,
    name: studentData.name,
    phone: studentData.phone || null,
    school: studentData.school,
    grade: studentData.grade,
    goal: studentData.goal,
    class_id: Number(studentData.classId) || 1
  };

  const cls = MOCK_CLASSES.find(c => c.id === MOCK_STUDENTS[studentIndex].class_id) || null;
  return {
    ...MOCK_STUDENTS[studentIndex],
    parents: updatedParent,
    classes: cls
  };
};

// 학생 & 학부모 삭제 API
export const deleteStudent = async (id) => {
  if (hasSupabaseConfig) {
    try {
      // 1. 삭제할 학생의 parent_id를 먼저 확보
      const { data: currentStudent, error: fetchError } = await supabase
        .from('students')
        .select('parent_id')
        .eq('id', id)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: No rows returned
        throw fetchError;
      }
      
      const parentId = currentStudent?.parent_id;

      // 2. 학생 레코드 삭제 (analyses는 CASCADE 옵션으로 스키마 상 자동 삭제됨)
      const { error: studentDeleteError } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
        
      if (studentDeleteError) throw studentDeleteError;

      // 3. 학부모 레코드 삭제 (데이터 고립 방지를 위해 함께 삭제)
      if (parentId) {
        const { error: parentDeleteError } = await supabase
          .from('parents')
          .delete()
          .eq('id', parentId);
          
        if (parentDeleteError) {
          console.warn('Parent record deletion failed, but student was deleted:', parentDeleteError);
        }
      }

      return { success: true };
    } catch (e) {
      console.error('Supabase delete student failed:', e);
      throw e;
    }
  }

  // --- Mock Fallback ---
  await delay(400);
  const studentIndex = MOCK_STUDENTS.findIndex(s => String(s.id) === String(id));
  if (studentIndex === -1) throw new Error('Student not found in mock');

  const student = MOCK_STUDENTS[studentIndex];

  // Mock Parent 삭제
  if (student.parent_id) {
    MOCK_PARENTS = MOCK_PARENTS.filter(p => p.id !== student.parent_id);
  }

  // Mock Student 삭제
  MOCK_STUDENTS = MOCK_STUDENTS.filter(s => String(s.id) !== String(id));

  return { success: true };
};

