// File: src/types/product.ts

export enum ProductCategory {
    GAME_CARD = 'GAME_CARD',
    GAME_TOP_UP = 'GAME_TOP_UP',
  }
  
  export enum ProductPopularity {
    POPULAR = 'POPULAR',
    NEW = 'NEW',
    REGULAR = 'REGULAR',
  }
  
  export interface ISubProduct {
    name: string;
    price: number;
    originalPrice: number;
    stockQuantity?: number;
    inStock: boolean;
  }
  
  export interface ICustomField {
    name: string;
    type: 'text' | 'number' | 'boolean';
    required: boolean;
    label: string;
  }
  
  export interface IProduct {
    _id: string;
    title: string;
    description: string;
    guide?: string;
    guideEnabled: boolean;
    imageUrl: string;
    region: string;
    instantDelivery: boolean;
    importantNote?: string;
    customFields: ICustomField[];
    subProducts: ISubProduct[];
    isIDBased: boolean;
    idFields?: { label: string }[];
    category: ProductCategory;
    popularity: ProductPopularity;
    countryCode: string;
    displayOrder: number;
  }
  