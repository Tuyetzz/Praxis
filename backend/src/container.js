// backend/src/container.js
const { createContainer, asClass, asValue, asFunction } = require('awilix');
const createAuthMiddleware = require('./interfaces/middlewares/authMiddleware');

//repositories
const AnswerRepository = require('./infrastructure/repositories/AnswerRepository');
const AttemptQuestionRepository = require('./infrastructure/repositories/AttemptQuestionRepository');
const AttemptRepository = require('./infrastructure/repositories/AttemptRepository');
const AuthSessionRepository = require('./infrastructure/repositories/AuthSessionRepository');
const BaseRepository = require('./infrastructure/repositories/BaseRepository');
const ChapterRepository = require('./infrastructure/repositories/ChapterRepository');
const FlashcardDeckRepository = require('./infrastructure/repositories/FlashcardDeckRepository');
const FlashcardRepository = require('./infrastructure/repositories/FlashcardRepository');
const OptionRepository = require('./infrastructure/repositories/OptionRepository');
const PermissionRepository = require('./infrastructure/repositories/PermissionRepository');
const QuestionRepository = require('./infrastructure/repositories/QuestionRepository');
const ResultSummaryRepository = require('./infrastructure/repositories/ResultSummaryRepository');
const RolePermissionRepository = require('./infrastructure/repositories/RolePermissionRepository');
const RoleRepository = require('./infrastructure/repositories/RoleRepository');
const SubjectRepository = require('./infrastructure/repositories/SubjectRepository');
const TypingResultRepository = require('./infrastructure/repositories/TypingResultRepository');
const TypingTextRepository = require('./infrastructure/repositories/TypingTextRepository');
const UserRepository = require('./infrastructure/repositories/UserRepository');
const UserRoleRepository = require('./infrastructure/repositories/UserRoleRepository');

//controllers
const ChapterController = require('./interfaces/controllers/ChapterController');
const AuthController = require('./interfaces/controllers/AuthController');
const SubjectController = require('./interfaces/controllers/SubjectController');
const QuestionController = require('./interfaces/controllers/QuestionController');
const OptionController = require('./interfaces/controllers/OptionController');
const RoleController = require('./interfaces/controllers/RoleController');
const PermissionController = require('./interfaces/controllers/PermissionController');
const UserController = require('./interfaces/controllers/UserController');
const AttemptController = require('./interfaces/controllers/AttemptController');


// usecases
const AddBatchQuestions = require('./usecases/question/AddBatchQuestions');
const AssignPermissionToRole = require('./usecases/role/AssignPermissionToRole');
const AssignRoleToUser = require('./usecases/role/AssignRoleToUser');
const CreateChapter = require('./usecases/chapter/CreateChapter');
const CreateOption = require('./usecases/option/CreateOption');
const CreateQuestion = require('./usecases/question/CreateQuestion');
const CreateRole = require('./usecases/role/CreateRole');
const CreateSubject = require('./usecases/subject/CreateSubject');
const CreateUser = require('./usecases/user/CreateUser');
const DeleteChapter = require('./usecases/chapter/DeleteChapter');
const DeleteOption = require('./usecases/option/DeleteOption');
const DeleteQuestion = require('./usecases/question/DeleteQuestion');
const DeleteRole = require('./usecases/role/DeleteRole');
const DeleteSubject = require('./usecases/subject/DeleteSubject');
const DeleteUser = require('./usecases/user/DeleteUser');
const GetChapters = require('./usecases/chapter/GetChapters');
const GetChaptersBySubject = require('./usecases/chapter/GetChaptersBySubject');
const GetOneChapter = require('./usecases/chapter/GetOneChapter');
const GetOneOption = require('./usecases/option/GetOneOption');
const GetOneQuestion = require('./usecases/question/GetOneQuestion');
const GetOneRole = require('./usecases/role/GetOneRole');
const GetOneSubject = require('./usecases/subject/GetOneSubject');
const GetOneUser = require('./usecases/user/GetOneUser');
const GetOptions = require('./usecases/option/GetOptions');
const GetOptionsByQuestion = require('./usecases/option/GetOptionsByQuestion');
const GetPermissions = require('./usecases/permission/GetPermissions');
const GetQuestions = require('./usecases/question/GetQuestions');
const GetQuestionsByChapter = require('./usecases/question/GetQuestionsByChapter');
const GetQuestionsBySubject = require('./usecases/question/GetQuestionsBySubject');
const GetRoles = require('./usecases/role/GetRoles');
const GetRolePermissions = require('./usecases/role/GetRolePermissions');
const GetSubjects = require('./usecases/subject/GetSubjects');
const GetUsers = require('./usecases/user/GetUsers');
const GetUserRoles = require('./usecases/role/GetUserRoles');
const ImportQuestionsFromFile = require('./usecases/question/ImportQuestionsFromFile');
const LoginUser = require('./usecases/user/LoginUser');
const LogoutUser = require('./usecases/user/LogoutUser');
const RefreshTokenUseCase = require('./usecases/user/RefreshTokenUseCase');
const RegisterUser = require('./usecases/user/RegisterUser');
const RemovePermissionFromRole = require('./usecases/role/RemovePermissionFromRole');
const RemoveRoleFromUser = require('./usecases/role/RemoveRoleFromUser');
const SearchChapter = require('./usecases/chapter/SearchChapter');
const SearchQuestion = require('./usecases/question/SearchQuestion');
const SearchSubject = require('./usecases/subject/SearchSubject');
const UpdateChapter = require('./usecases/chapter/UpdateChapter');
const UpdateOption = require('./usecases/option/UpdateOption');
const UpdateQuestion = require('./usecases/question/UpdateQuestion');
const UpdateRole = require('./usecases/role/UpdateRole');
const UpdateSubject = require('./usecases/subject/UpdateSubject');
const UpdateUser = require('./usecases/user/UpdateUser');
const StartAttempt = require('./usecases/attempt/StartAttempt');
const GetAttempt = require('./usecases/attempt/GetAttempt');
const SaveAnswer = require('./usecases/attempt/SaveAnswer');
const SubmitAttempt = require('./usecases/attempt/SubmitAttempt');
const GetAttemptGrade = require('./usecases/attempt/GetAttemptGrade');
const SequelizeUnitOfWork = require('./infrastructure/unitOfWork/SequelizeUnitOfWork');


const authHelper = require('./infrastructure/utils/auth_helper');
const { hashPassword, comparePassword, generateTokens } = authHelper;
const redisClient = require('./infrastructure/cache/redisClient');

const container = createContainer();


container.register({
  
  userRepository: asClass(UserRepository).singleton(),
  redisClient: asValue(redisClient),
  authHelper: asValue(authHelper),
  // helpers
  hashPassword: asValue(hashPassword),
  comparePassword: asValue(comparePassword),
  generateTokens: asValue(generateTokens),
  // usecases
  addBatchQuestions: asClass(AddBatchQuestions).singleton(),
  assignPermissionToRole: asClass(AssignPermissionToRole).singleton(),
  assignRoleToUser: asClass(AssignRoleToUser).singleton(),
  createChapter: asClass(CreateChapter).singleton(),
  createOption: asClass(CreateOption).singleton(),
  createQuestion: asClass(CreateQuestion).singleton(),
  createRole: asClass(CreateRole).singleton(),
  createSubject: asClass(CreateSubject).singleton(),
  createUser: asClass(CreateUser).singleton(),
  deleteChapter: asClass(DeleteChapter).singleton(),
  deleteOption: asClass(DeleteOption).singleton(),
  deleteQuestion: asClass(DeleteQuestion).singleton(),
  deleteRole: asClass(DeleteRole).singleton(),
  deleteSubject: asClass(DeleteSubject).singleton(),
  deleteUser: asClass(DeleteUser).singleton(),
  getChapters: asClass(GetChapters).singleton(),
  getChaptersBySubject: asClass(GetChaptersBySubject).singleton(),
  getOneChapter: asClass(GetOneChapter).singleton(),
  getOneOption: asClass(GetOneOption).singleton(),
  getOneQuestion: asClass(GetOneQuestion).singleton(),
  getOneRole: asClass(GetOneRole).singleton(),
  getOneSubject: asClass(GetOneSubject).singleton(),
  getOneUser: asClass(GetOneUser).singleton(),
  getOptions: asClass(GetOptions).singleton(),
  getOptionsByQuestion: asClass(GetOptionsByQuestion).singleton(),
  getPermissions: asClass(GetPermissions).singleton(),
  getQuestions: asClass(GetQuestions).singleton(),
  getQuestionsByChapter: asClass(GetQuestionsByChapter).singleton(),
  getQuestionsBySubject: asClass(GetQuestionsBySubject).singleton(),
  getRoles: asClass(GetRoles).singleton(),
  getRolePermissions: asClass(GetRolePermissions).singleton(),
  getSubjects: asClass(GetSubjects).singleton(),
  getUsers: asClass(GetUsers).singleton(),
  getUserRoles: asClass(GetUserRoles).singleton(),
  importQuestionsFromFile: asClass(ImportQuestionsFromFile).singleton(),
  loginUser: asClass(LoginUser).singleton(),
  logoutUser: asClass(LogoutUser).singleton(),
  refreshTokenUseCase: asClass(RefreshTokenUseCase).singleton(),
  registerUser: asClass(RegisterUser).singleton(),
  removePermissionFromRole: asClass(RemovePermissionFromRole).singleton(),
  removeRoleFromUser: asClass(RemoveRoleFromUser).singleton(),
  searchChapter: asClass(SearchChapter).singleton(),
  searchQuestion: asClass(SearchQuestion).singleton(),
  searchSubject: asClass(SearchSubject).singleton(),
  updateChapter: asClass(UpdateChapter).singleton(),
  updateOption: asClass(UpdateOption).singleton(),
  updateQuestion: asClass(UpdateQuestion).singleton(),
  updateRole: asClass(UpdateRole).singleton(),
  updateSubject: asClass(UpdateSubject).singleton(),
  updateUser: asClass(UpdateUser).singleton(),
  startAttempt: asClass(StartAttempt).scoped(),
  getAttempt: asClass(GetAttempt).singleton(),
  saveAnswer: asClass(SaveAnswer).scoped(),
  submitAttempt: asClass(SubmitAttempt).scoped(),
  getAttemptGrade: asClass(GetAttemptGrade).singleton(),
  unitOfWork: asClass(SequelizeUnitOfWork).scoped(),
  answerRepository: asClass(AnswerRepository).singleton(),
  attemptQuestionRepository: asClass(AttemptQuestionRepository).singleton(),
  attemptRepository: asClass(AttemptRepository).singleton(),
  authSessionRepository: asClass(AuthSessionRepository).singleton(),
  baseRepository: asClass(BaseRepository).singleton(),
  chapterRepository: asClass(ChapterRepository).singleton(),
  flashcardDeckRepository: asClass(FlashcardDeckRepository).singleton(),
  flashcardRepository: asClass(FlashcardRepository).singleton(),
  optionRepository: asClass(OptionRepository).singleton(),
  permissionRepository: asClass(PermissionRepository).singleton(),
  questionRepository: asClass(QuestionRepository).singleton(),
  resultSummaryRepository: asClass(ResultSummaryRepository).singleton(),
  rolePermissionRepository: asClass(RolePermissionRepository).singleton(),
  roleRepository: asClass(RoleRepository).singleton(),
  subjectRepository: asClass(SubjectRepository).singleton(),
  typingResultRepository: asClass(TypingResultRepository).singleton(),
  typingTextRepository: asClass(TypingTextRepository).singleton(),
  userRoleRepository: asClass(UserRoleRepository).singleton(),
  chapterController: asClass(ChapterController).singleton(),
  authController: asClass(AuthController).singleton(),
  subjectController: asClass(SubjectController).singleton(),
  questionController: asClass(QuestionController).singleton(),
  optionController: asClass(OptionController).singleton(),
  roleController: asClass(RoleController).singleton(),
  permissionController: asClass(PermissionController).singleton(),
  userController: asClass(UserController).singleton(),
  attemptController: asClass(AttemptController).singleton(),

  
  authMiddleware: asFunction(createAuthMiddleware).singleton(),
});

module.exports = container;