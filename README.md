## 0. 담당한 기능 개발 및 구현 기술  
- **기능 개발**  
  - 로그인·회원가입 폼 및 세션 저장/제거 (sessionStorage)  
  - 메인 페이지 반응형 레이아웃(grid) + YouTube 임베딩(iframe)  
  - 커뮤니티 글·댓글보기·작성(CRUD)  
  - 사용자 프로필 페이지: ID·이번달 운동 횟수·맞춤 인사말 편집  
  - 운동 기록 페이지: 달력 클릭으로 날짜 선택, 일반/상세(Fitness) 기록 추가·삭제  
  - Firebase Firestore 연동: 사용자정보, 게시글, 운동기록 저장·조회  
- **구현 기술**  
  - HTML5, CSS3, JavaScript  
  - Firebase Firestore REST API

## 1. 제목  
**웹 기반 운동 기록 & 커뮤니티 플랫폼**
  
## 2. 배경 및 문제  
- 개인 운동 이력을 한번에 관리/조회하고 싶은 경우가 존재  
- 운동 관련 소통·피드백을 운동하는 사람들과 함께 얘기하고 싶은 경우 존재 

## 3. 목표  
- **통합 로그 관리**: 로그인 사용자별 운동 기록을 날짜별로 저장·조회  
- **커뮤니티 기능**: 운동 팁·질문을 나누고 댓글 남길 수 있는 게시판 제공  
- **캘린더 UI**: 클릭한 날짜에 기록 추가/삭제, 기록 있는 날 시각 표시  
- **실시간 동기화**: Firebase Firestore로 모든 데이터 즉시 저장·갱신 

## 4. 기대 효과  
- 사용자는 **언제든 운동 이력**을 캘린더로 확인하고 쉽게 기록 추가  
- **커뮤니티 참여**를 통해 운동 동기 부여 및 정보 공유  
- **프로필·통계** 기반 개인화된 피드백 제공 가능  
- **간편한 웹 인터페이스**로 별도 앱 설치 없이 접근 

## 5. 구현 내용  
1. **로그인 페이지**  
   - ID/PW 검증 → Firestore 조회 후 성공 시 세션 저장 → 메인 페이지 이동  
   - 회원가입: 이름·ID(최대10자)·PW 입력 → Firestore에 신규 문서 생성
   - ![Image](https://github.com/user-attachments/assets/93d80679-a11e-426a-9007-e27c40b427e9)

2. **메인 페이지**  
   - 반응형 그리드로 서비스 소개·동기 부여 콘텐츠 배치  
   - YouTube 영상 임베딩(iframe)  
   - ‘커뮤니티 이동’ 버튼으로 게시판 페이지로 링크
   - ![Image](https://github.com/user-attachments/assets/62171dbc-92da-4088-86ad-3bc3b72ae6aa)
   - ![Image](https://github.com/user-attachments/assets/1b9403a7-84d5-4656-b374-4c79279ef4fd)
   - ![Image](https://github.com/user-attachments/assets/2d0e3d72-d09c-49ca-b5aa-c34898bc64d7)

3. **커뮤니티 페이지**  
   - 게시글 리스트/상세·댓글 보기  
   - 로그인 시 글 쓰기·댓글 작성 가능 (비회원은 조회만)  
   - sessionStorage로 로그인 여부 확인
   - ![Image](https://github.com/user-attachments/assets/3bbd1bc6-0c75-4d59-ba30-b9f37735ff65)
   - ![Image](https://github.com/user-attachments/assets/3e31de39-88b6-4e48-a998-c9df9b9330d9)
   - ![Image](https://github.com/user-attachments/assets/666ee0f5-5986-4201-8662-42d800e14af8)

4. **사용자 페이지**  
   - ID, 이번달 운동 횟수, 인사말 표시  
   - 인사말 편집 아이콘 → Firestore에 업데이트  
   - ‘운동 기록 보기’ 버튼 → 선택한 ID 세션에 저장 → 운동 기록 페이지로 이동
   - ![Image](https://github.com/user-attachments/assets/ba4bc683-84ec-480f-926a-b923dbbdc51f)

5. **운동 기록 페이지**  
   - 클릭 가능한 달력: 선택 날짜 붉은 테두리 표시  
   - 기록 있는 날짜에 불꽃 아이콘 배경 적용  
   - 일반 기록: 운동 종류·시간 입력  
   - 상세 기록(Fitness): 중량·반복 횟수 입력(최대 4세트)  
   - 로그인 소유자만 추가·삭제, 타 사용자 페이지 경유 시 조회만
   - ![Image](https://github.com/user-attachments/assets/a81fb138-45f5-4e21-8a03-e7b4c0dc8f5d)
   - ![Image](https://github.com/user-attachments/assets/b396d12c-1f7b-4e32-aa7a-aa84e6381f9b)
   - ![Image](https://github.com/user-attachments/assets/1ed94782-af60-4d8d-a4bc-c665238c4a74)
   - ![Image](https://github.com/user-attachments/assets/2982fb39-873a-4611-b7cc-417c3ffa18b1)

6. **Firebase 구성**  
   - `user-info` 컬렉션: 사용자 정보(ID, 이름, PW 등)  
   - `post-page` 컬렉션: 게시글·댓글 데이터  
   - `workout-record` 컬렉션: 문서 ID = 사용자 ID, `details` 필드에 날짜별 기록 배열 저장
   - ![Image](https://github.com/user-attachments/assets/d1cfb982-2289-4247-8c61-5f08486b80f1) 


When executing the code, do not enter 
"firebase deploy" in the console. 
It makes Firestore (Firebase database) not reachable

Just open it in live server then it will run without any problems!
