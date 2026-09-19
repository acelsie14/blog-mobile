//Preview models
export interface AuthorPreview {
  _id: string;
  username: string;
  profileImage?: string;
}

export interface CategoryPreview {
  _id: string;
  name: string;
  slug: string;
}

export interface TagPreview {
  _id: string;
  name: string;
  slug: string;
}

export interface BookmarkPostPreview {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: AuthorPreview;
}

//Domain models
export type UserRole = 'admin' | 'editor' | 'pending';
export type PostStatus = 'draft' | 'published';
export type MediaType = 'text' | 'image' | 'audio';

export interface User {
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
  bio?: string;
  role: UserRole;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  mediaType: MediaType;
  mediaUrl: string;
  featuredImage?: string;
  excerpt?: string;
  status: PostStatus;
  wordCount: number;
  maxWords: number;
  author: AuthorPreview;
  publishedAt?: string;
  readingTime: number;
  tags: TagPreview[];
  categories: CategoryPreview[];
  likes: string[];
  viewCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: AuthorPreview;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: string[];
  isEdited: boolean;
  parentComment?: string | null;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  _id: string;
  name: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  _id: string;
  user: string;
  post: BookmarkPostPreview;
  createdAt: string;
  updatedAt: string;
}
//Authentication payloads
export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  bio: string;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  profileImage?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// Post payloads
export interface CreatePostPayload {
  title: string;
  content: string;
  mediaType?: MediaType;
  mediaUrl?: string;
  featuredImage?: string;
  excerpt?: string;
  status?: PostStatus;
  tags?: string[];
  categories?: string[];
}

export interface UpdatePostPayload {
  title?: string;
  content?: string;
  mediaType?: MediaType;
  mediaUrl?: string;
  featuredImage?: string;
  excerpt?: string;
  status?: PostStatus;
  tags?: string[];
  categories?: string[];
}
// Comment payloads
export interface CreateCommentPayload {
  content: string;
}

export interface UpdateCommentPayload {
  content: string;
}
// Category and Tag payloads
export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
}

export interface UpdateTagPayload {
  name?: string;
}
//Admin payloads
export interface CreateEditorPayload {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  bio: string;
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;

  bio?: string;
  role?: UserRole;
}

export interface ApiResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number; // some routes include count
}
export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedApiResult<T = unknown> extends ApiResult<T> {
  pagination?: PaginationMeta;
}
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<ApiResult<void>>;
  register: (payload: RegisterPayload) => Promise<ApiResult<void>>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<ApiResult<User>>;
  changePassword: (payload: ChangePasswordPayload) => Promise<ApiResult<void>>;
  deleteAccount: () => Promise<ApiResult<void>>;
}

export interface PostContextType {
  getPosts: (params?: GetPostsParams) => Promise<PaginatedApiResult<Post[]>>;
  getPost: (id: string) => Promise<ApiResult<Post>>;
  createPost: (payload: CreatePostPayload) => Promise<ApiResult<Post>>;
  updatePost: (
    postId: string,
    payload: UpdatePostPayload,
  ) => Promise<ApiResult<Post>>;
  deletePost: (postId: string) => Promise<ApiResult<void>>;
  publishPost: (postId: string) => Promise<ApiResult<Post>>;
  unpublishPost: (postId: string) => Promise<ApiResult<Post>>;
  likePost: (postId: string) => Promise<ApiResult<void>>;
  unlikePost: (postId: string) => Promise<ApiResult<void>>;
  bookmarkPost: (postId: string) => Promise<ApiResult<void>>;
  unbookmarkPost: (postId: string) => Promise<ApiResult<void>>;
  getBookmarks: (
    params?: GetBookmarkParams,
  ) => Promise<PaginatedApiResult<Bookmark[]>>;
}

export interface CommentContextType {
  getComments: (postId: string) => Promise<ApiResult<Comment[]>>;
  createComment: (
    postId: string,
    payload: CreateCommentPayload,
  ) => Promise<ApiResult<Comment>>;
  updateComment: (
    id: string,
    payload: UpdateCommentPayload,
  ) => Promise<ApiResult<Comment>>;
  deleteComment: (id: string) => Promise<ApiResult<void>>;
  likeComment: (id: string) => Promise<ApiResult<void>>;
  unlikeComment: (id: string) => Promise<ApiResult<void>>;
}

export interface AdminContextType {
  getPendingUsers: () => Promise<ApiResult<User[]>>;
  approveUser: (userId: string) => Promise<ApiResult<void>>;
  rejectUser: (userId: string) => Promise<ApiResult<void>>;
  createEditor: (payload: CreateEditorPayload) => Promise<ApiResult<void>>;
  getAllUsers: (params?: GetAllUsersParams) => Promise<ApiResult<User[]>>;
  getUser: (userId: string) => Promise<ApiResult<User>>;
  updateUser: (
    userId: string,
    payload: UpdateUserPayload,
  ) => Promise<ApiResult<User>>;
  deleteUser: (userId: string) => Promise<ApiResult<void>>;
  deactivateUser: (userId: string) => Promise<ApiResult<void>>;
  activateUser: (userId: string) => Promise<ApiResult<void>>;
}

export interface CategoryTagContextType {
  getCategories: () => Promise<ApiResult<Category[]>>;
  getCategoryBySlug: (slug: string) => Promise<ApiResult<Category>>;
  createCategory: (
    payload: CreateCategoryPayload,
  ) => Promise<ApiResult<Category>>;
  updateCategory: (
    id: string,
    payload: UpdateCategoryPayload,
  ) => Promise<ApiResult<Category>>;
  deleteCategory: (id: string) => Promise<ApiResult<void>>;
  getTags: () => Promise<ApiResult<Tag[]>>;
  getTagBySlug: (slug: string) => Promise<ApiResult<Tag>>;
  updateTag: (id: string, payload: UpdateTagPayload) => Promise<ApiResult<Tag>>;
  deleteTag: (id: string) => Promise<ApiResult<void>>;
}

export interface UploadResult {
  success: boolean;
  url: string;
  message?: string;
}

export interface UploadContextType {
  uploadImage: (
    uri: string,
    type: string,
    name: string,
  ) => Promise<ApiResult<string>>;
}
export interface GetPostsParams {
  status?: PostStatus;
  page?: number;
  limit?: number;
  author?: string;
  category?: string;
  tag?: string;
  search?: string;
}

export interface GetBookmarkParams {
  page?: number;
  limit?: number;
}

export interface GetAllUsersParams {
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
}
