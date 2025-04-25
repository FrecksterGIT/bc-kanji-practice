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
  WanikaniLevelProgression,
  WanikaniReview,
  WanikaniVoiceActor,
  WanikaniReset,
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
      Authorization: `Bearer ${apiKey}`,
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
    const url = isFullUrl ? new URL(endpointOrUrl) : new URL(`${this.baseUrl}${endpointOrUrl}`);

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

    return (await response.json()) as T;
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
   * Builds query parameters for API requests
   * @param params The parameters object to process
   * @returns A record of string keys and string values for use in API requests
   */
  private buildQueryParams(
    params?: Record<string, string | number | boolean | Date | string[] | number[] | undefined>
  ): Record<string, string> {
    const queryParams: Record<string, string> = {};

    if (!params) {
      return queryParams;
    }

    // Process each parameter based on its type
    Object.entries(params).forEach(([key, value]) => {
      // Skip undefined values
      if (value === undefined) {
        return;
      }

      // Handle different types of values
      if (value instanceof Date) {
        // Date parameters
        queryParams[key] = value.toISOString();
      } else if (Array.isArray(value) && value.length > 0) {
        // Array parameters (join with commas)
        queryParams[key] = value.join(',');
      } else if (typeof value === 'boolean') {
        // Boolean parameters
        queryParams[key] = value.toString();
      } else if (typeof value === 'number') {
        // Number parameters
        queryParams[key] = value.toString();
      } else if (typeof value === 'string') {
        // String parameters
        queryParams[key] = value;
      } else if (value === null) {
        // Special case for null values (skip)
        return;
      } else if (typeof value === 'object' && Object.keys(value).length === 0) {
        // Special case for empty objects (used as flags)
        queryParams[key] = '';
      }
    });

    return queryParams;
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
   * @param params.started Filter by assignments that have been started
   * @param params.level Filter by a specific level (deprecated, use levels instead)
   * @param params.subject_types Filter by subject types as a comma-separated string (deprecated, use subject_types array instead)
   * @param params.page_after_id Get results after this ID
   * @param params.page_before_id Get results before this ID
   * @param params.updated_after Get assignments updated after this date
   * @param params.available_after Get assignments available at or after this date
   * @param params.available_before Get assignments available at or before this date
   * @param params.burned Filter by assignments that have been burned
   * @param params.hidden Filter by assignments that are hidden
   * @param params.unlocked Filter by assignments that have been unlocked
   * @param params.ids Filter by specific assignment IDs
   * @param params.levels Filter by specific levels (1-60)
   * @param params.srs_stages Filter by specific SRS stages (0-9)
   * @param params.subject_ids Filter by specific subject IDs
   * @param params.subject_types Filter by specific subject types (array of: "radical", "kanji", "vocabulary", "kana_vocabulary")
   * @param params.immediately_available_for_lessons Get assignments immediately available for lessons
   * @param params.immediately_available_for_review Get assignments immediately available for review
   * @param params.in_review Get assignments that are in review
   * @param fetchAllPages Whether to fetch all pages of results (default: false)
   * @param maxPages Maximum number of pages to fetch when fetchAllPages is true (default: unlimited)
   * @returns The assignments data or all assignments if fetchAllPages is true
   */
  async getAssignments(
    params?: {
      // Original parameters
      started?: boolean;
      page_after_id?: number;
      page_before_id?: number;
      updated_after?: Date;

      // New date filters
      available_after?: Date;
      available_before?: Date;

      // New boolean filters
      burned?: boolean;
      hidden?: boolean;
      unlocked?: boolean;

      // New array filters
      ids?: number[];
      levels?: number[];
      srs_stages?: number[];
      subject_ids?: number[];
      subject_types?: string[];

      // Special filters
      immediately_available_for_lessons?: boolean;
      immediately_available_for_review?: boolean;
      in_review?: boolean;
    },
    fetchAllPages: boolean = false,
    maxPages: number = Infinity
  ): Promise<WanikaniAssignmentsResponse | WanikaniAssignment[]> {
    const queryParams = this.buildQueryParams(params);

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
    const queryParams = this.buildQueryParams(params);

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
    const queryParams = this.buildQueryParams(params);

    const response = await this.request<WanikaniReviewStatisticsResponse>(
      '/review_statistics',
      queryParams
    );

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
    const queryParams = this.buildQueryParams(params);

    const response = await this.request<WanikaniStudyMaterialsResponse>(
      '/study_materials',
      queryParams
    );

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
    const queryParams = this.buildQueryParams(params);

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
    const queryParams = this.buildQueryParams(params);

    const response = await this.request<WanikaniLevelProgressionsResponse>(
      '/level_progressions',
      queryParams
    );

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
    const queryParams = this.buildQueryParams(params);

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
    const queryParams = this.buildQueryParams(params);

    const response = await this.request<WanikaniResetsResponse>('/resets', queryParams);

    if (fetchAllPages) {
      return await this.fetchAllPages(response, maxPages);
    }

    return response;
  }
}
