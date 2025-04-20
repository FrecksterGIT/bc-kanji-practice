import {
  WanikaniUserResponse,
  WanikaniAssignmentsResponse,
  WanikaniSubjectsResponse,
  WanikaniReviewStatisticsResponse,
  WanikaniStudyMaterialsResponse,
  WanikaniSummaryResponse,
  WanikaniReviewsResponse,
  WanikaniLevelProgressionsResponse,
  WanikaniVoiceActorsResponse,
  WanikaniResetsResponse,
  WanikaniCollectionResponse,
  WanikaniAssignment,
  WanikaniSubject,
  WanikaniReviewStatistic,
  WanikaniStudyMaterial,
  WanikaniLevelProgression, WanikaniReview, WanikaniVoiceActor, WanikaniReset
} from '../types';

/**
 * WaniKani API client for interacting with the WaniKani API
 * Documentation: https://docs.api.wanikani.com/20170710/
 */
export class WaniKaniApiClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.wanikani.com/v2';
  private readonly headers: HeadersInit;

  /**
   * Creates a new WaniKani API client
   * @param apiKey The WaniKani API token
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Wanikani-Revision': '20170710',
    };
  }

  /**
   * Makes a request to the WaniKani API
   * @param endpointOrUrl The API endpoint or full URL to request
   * @param params Optional query parameters
   * @returns The response data
   */
  private async request<T>(endpointOrUrl: string, params?: Record<string, string>): Promise<T> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    // Determine if the input is a full URL or an endpoint
    const isFullUrl = endpointOrUrl.startsWith('http');
    const url = isFullUrl
      ? new URL(endpointOrUrl)
      : new URL(`${this.baseUrl}${endpointOrUrl}`);

    // Add query parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json() as T;
  }

  /**
   * Fetches all pages of a collection
   * @param initialResponse The initial response from a collection endpoint
   * @param maxPages Maximum number of pages to fetch (default: unlimited)
   * @returns All items from all pages
   */
  private async fetchAllPages<T>(
    initialResponse: WanikaniCollectionResponse<T>,
    maxPages: number = Infinity
  ): Promise<T[]> {
    let allItems: T[] = [...initialResponse.data];
    let nextUrl = initialResponse.pages.next_url;
    let pageCount = 1;

    while (nextUrl && pageCount < maxPages) {
      const nextResponse = await this.request<WanikaniCollectionResponse<T>>(nextUrl);
      allItems = [...allItems, ...nextResponse.data];
      nextUrl = nextResponse.pages.next_url;
      pageCount++;
    }

    return allItems;
  }

  /**
   * Gets the user's information
   * @returns The user data
   */
  async getUser(): Promise<WanikaniUserResponse> {
    return this.request<WanikaniUserResponse>('/user');
  }

  /**
   * Gets the user's assignments
   * @param params Optional query parameters
   * @param fetchAllPages Whether to fetch all pages of results (default: false)
   * @param maxPages Maximum number of pages to fetch when fetchAllPages is true (default: unlimited)
   * @returns The assignments data or all assignments if fetchAllPages is true
   */
  async getAssignments(
    params?: {
      started?: boolean;
      level?: number;
      subject_types?: string;
      page_after_id?: number;
      page_before_id?: number;
      updated_after?: Date;
    },
    fetchAllPages: boolean = false,
    maxPages: number = Infinity
  ): Promise<WanikaniAssignmentsResponse | WanikaniAssignment[]> {
    const queryParams: Record<string, string> = {};

    if (params?.started !== undefined) {
      queryParams.started = params.started.toString();
    }

    if (params?.level !== undefined) {
      queryParams.levels = params.level.toString();
    }

    if (params?.subject_types) {
      queryParams.subject_types = params.subject_types;
    }

    if (params?.page_after_id !== undefined) {
      queryParams.page_after_id = params.page_after_id.toString();
    }

    if (params?.page_before_id !== undefined) {
      queryParams.page_before_id = params.page_before_id.toString();
    }

    if (params?.updated_after) {
      queryParams.updated_after = params.updated_after.toISOString();
    }

    const response = await this.request<WanikaniAssignmentsResponse>('/assignments', queryParams);

    if (fetchAllPages) {
      return await this.fetchAllPages(response, maxPages);
    }

    return response;
  }

  /**
   * Gets subjects (kanji, vocabulary, etc.)
   * @param params Optional query parameters
   * @param fetchAllPages Whether to fetch all pages of results (default: false)
   * @param maxPages Maximum number of pages to fetch when fetchAllPages is true (default: unlimited)
   * @returns The subjects data or all subjects if fetchAllPages is true
   */
  async getSubjects(
    params?: {
      ids?: number[];
      types?: string[];
      levels?: number[];
      slugs?: string[];
      hidden?: boolean;
      page_after_id?: number;
      page_before_id?: number;
      updated_after?: Date;
    },
    fetchAllPages: boolean = false,
    maxPages: number = Infinity
  ): Promise<WanikaniSubjectsResponse | WanikaniSubject[]> {
    const queryParams: Record<string, string> = {};

    if (params?.ids && params.ids.length > 0) {
      queryParams.ids = params.ids.join(',');
    }

    if (params?.types && params.types.length > 0) {
      queryParams.types = params.types.join(',');
    }

    if (params?.levels && params.levels.length > 0) {
      queryParams.levels = params.levels.join(',');
    }

    if (params?.slugs && params.slugs.length > 0) {
      queryParams.slugs = params.slugs.join(',');
    }

    if (params?.hidden !== undefined) {
      queryParams.hidden = params.hidden.toString();
    }

    if (params?.page_after_id !== undefined) {
      queryParams.page_after_id = params.page_after_id.toString();
    }

    if (params?.page_before_id !== undefined) {
      queryParams.page_before_id = params.page_before_id.toString();
    }

    if (params?.updated_after) {
      queryParams.updated_after = params.updated_after.toISOString();
    }

    const response = await this.request<WanikaniSubjectsResponse>('/subjects', queryParams);

    if (fetchAllPages) {
      return await this.fetchAllPages(response, maxPages);

    }

    return response;
  }

  /**
   * Gets review statistics
   * @param params Optional query parameters
   * @param fetchAllPages Whether to fetch all pages of results (default: false)
   * @param maxPages Maximum number of pages to fetch when fetchAllPages is true (default: unlimited)
   * @returns The review statistics data or all review statistics if fetchAllPages is true
   */
  async getReviewStatistics(
    params?: {
      subject_ids?: number[];
      percentages_greater_than?: number;
      percentages_less_than?: number;
      page_after_id?: number;
      page_before_id?: number;
      updated_after?: Date;
    },
    fetchAllPages: boolean = false,
    maxPages: number = Infinity
  ): Promise<WanikaniReviewStatisticsResponse | WanikaniReviewStatistic[]> {
    const queryParams: Record<string, string> = {};

    if (params?.subject_ids && params.subject_ids.length > 0) {
      queryParams.subject_ids = params.subject_ids.join(',');
    }

    if (params?.percentages_greater_than !== undefined) {
      queryParams.percentages_greater_than = params.percentages_greater_than.toString();
    }

    if (params?.percentages_less_than !== undefined) {
      queryParams.percentages_less_than = params.percentages_less_than.toString();
    }

    if (params?.page_after_id !== undefined) {
      queryParams.page_after_id = params.page_after_id.toString();
    }

    if (params?.page_before_id !== undefined) {
      queryParams.page_before_id = params.page_before_id.toString();
    }

    if (params?.updated_after) {
      queryParams.updated_after = params.updated_after.toISOString();
    }

    const response = await this.request<WanikaniReviewStatisticsResponse>('/review_statistics', queryParams);

    if (fetchAllPages) {
      return await this.fetchAllPages(response, maxPages);
    }

    return response;
  }

  /**
   * Gets study materials
   * @param params Optional query parameters
   * @param fetchAllPages Whether to fetch all pages of results (default: false)
   * @param maxPages Maximum number of pages to fetch when fetchAllPages is true (default: unlimited)
   * @returns The study materials data or all study materials if fetchAllPages is true
   */
  async getStudyMaterials(
    params?: {
      subject_ids?: number[];
      subject_types?: string[];
      page_after_id?: number;
      page_before_id?: number;
      updated_after?: Date;
    },
    fetchAllPages: boolean = false,
    maxPages: number = Infinity
  ): Promise<WanikaniStudyMaterialsResponse | WanikaniStudyMaterial[]> {
    const queryParams: Record<string, string> = {};

    if (params?.subject_ids && params.subject_ids.length > 0) {
      queryParams.subject_ids = params.subject_ids.join(',');
    }

    if (params?.subject_types && params.subject_types.length > 0) {
      queryParams.subject_types = params.subject_types.join(',');
    }

    if (params?.page_after_id !== undefined) {
      queryParams.page_after_id = params.page_after_id.toString();
    }

    if (params?.page_before_id !== undefined) {
      queryParams.page_before_id = params.page_before_id.toString();
    }

    if (params?.updated_after) {
      queryParams.updated_after = params.updated_after.toISOString();
    }

    const response = await this.request<WanikaniStudyMaterialsResponse>('/study_materials', queryParams);

    if (fetchAllPages) {
      return await this.fetchAllPages(response, maxPages);
    }

    return response;
  }

  /**
   * Gets summary data
   * @returns The summary data
   */
  async getSummary(): Promise<WanikaniSummaryResponse> {
    return this.request<WanikaniSummaryResponse>('/summary');
  }

  /**
   * Gets reviews
   * @param params Optional query parameters
   * @param fetchAllPages Whether to fetch all pages of results (default: false)
   * @param maxPages Maximum number of pages to fetch when fetchAllPages is true (default: unlimited)
   * @returns The reviews data or all reviews if fetchAllPages is true
   */
  async getReviews(
    params?: {
      subject_ids?: number[];
      updated_after?: Date;
      page_after_id?: number;
      page_before_id?: number;
    },
    fetchAllPages: boolean = false,
    maxPages: number = Infinity
  ): Promise<WanikaniReviewsResponse | WanikaniReview[]> {
    const queryParams: Record<string, string> = {};

    if (params?.subject_ids && params.subject_ids.length > 0) {
      queryParams.subject_ids = params.subject_ids.join(',');
    }

    if (params?.updated_after) {
      queryParams.updated_after = params.updated_after.toISOString();
    }

    if (params?.page_after_id !== undefined) {
      queryParams.page_after_id = params.page_after_id.toString();
    }

    if (params?.page_before_id !== undefined) {
      queryParams.page_before_id = params.page_before_id.toString();
    }

    const response = await this.request<WanikaniReviewsResponse>('/reviews', queryParams);

    if (fetchAllPages) {
      return await this.fetchAllPages(response, maxPages);
    }

    return response;
  }

  /**
   * Gets level progressions
   * @param params Optional query parameters
   * @param fetchAllPages Whether to fetch all pages of results (default: false)
   * @param maxPages Maximum number of pages to fetch when fetchAllPages is true (default: unlimited)
   * @returns The level progressions data or all level progressions if fetchAllPages is true
   */
  async getLevelProgressions(
    params?: {
      page_after_id?: number;
      page_before_id?: number;
      updated_after?: Date;
    },
    fetchAllPages: boolean = false,
    maxPages: number = Infinity
  ): Promise<WanikaniLevelProgressionsResponse | WanikaniLevelProgression[]> {
    const queryParams: Record<string, string> = {};

    if (params?.page_after_id !== undefined) {
      queryParams.page_after_id = params.page_after_id.toString();
    }

    if (params?.page_before_id !== undefined) {
      queryParams.page_before_id = params.page_before_id.toString();
    }

    if (params?.updated_after) {
      queryParams.updated_after = params.updated_after.toISOString();
    }

    const response = await this.request<WanikaniLevelProgressionsResponse>('/level_progressions', queryParams);

    if (fetchAllPages) {
      return await this.fetchAllPages(response, maxPages);
    }

    return response;
  }

  /**
   * Gets voice actors
   * @param params Optional query parameters
   * @param fetchAllPages Whether to fetch all pages of results (default: false)
   * @param maxPages Maximum number of pages to fetch when fetchAllPages is true (default: unlimited)
   * @returns The voice actors data or all voice actors if fetchAllPages is true
   */
  async getVoiceActors(
    params?: {
      page_after_id?: number;
      page_before_id?: number;
      updated_after?: Date;
    },
    fetchAllPages: boolean = false,
    maxPages: number = Infinity
  ): Promise<WanikaniVoiceActorsResponse | WanikaniVoiceActor[]> {
    const queryParams: Record<string, string> = {};

    if (params?.page_after_id !== undefined) {
      queryParams.page_after_id = params.page_after_id.toString();
    }

    if (params?.page_before_id !== undefined) {
      queryParams.page_before_id = params.page_before_id.toString();
    }

    if (params?.updated_after) {
      queryParams.updated_after = params.updated_after.toISOString();
    }

    const response = await this.request<WanikaniVoiceActorsResponse>('/voice_actors', queryParams);

    if (fetchAllPages) {
      return await this.fetchAllPages(response, maxPages);
    }

    return response;
  }

  /**
   * Gets resets
   * @param params Optional query parameters
   * @param fetchAllPages Whether to fetch all pages of results (default: false)
   * @param maxPages Maximum number of pages to fetch when fetchAllPages is true (default: unlimited)
   * @returns The resets data or all resets if fetchAllPages is true
   */
  async getResets(
    params?: {
      page_after_id?: number;
      page_before_id?: number;
      updated_after?: Date;
    },
    fetchAllPages: boolean = false,
    maxPages: number = Infinity
  ): Promise<WanikaniResetsResponse | WanikaniReset[]> {
    const queryParams: Record<string, string> = {};

    if (params?.page_after_id !== undefined) {
      queryParams.page_after_id = params.page_after_id.toString();
    }

    if (params?.page_before_id !== undefined) {
      queryParams.page_before_id = params.page_before_id.toString();
    }

    if (params?.updated_after) {
      queryParams.updated_after = params.updated_after.toISOString();
    }

    const response = await this.request<WanikaniResetsResponse>('/resets', queryParams);

    if (fetchAllPages) {
      return await this.fetchAllPages(response, maxPages);
    }

    return response;
  }
}
