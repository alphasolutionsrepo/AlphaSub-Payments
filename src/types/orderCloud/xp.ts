import {
  Address,
  Filters,
  SearchType,
  Searchable,
  Sortable,
  SubscriptionInterval,
} from "ordercloud-javascript-sdk";

export type OrderXp = {
  Status?: OrderStatus;
  Assignment?:
    | undefined
    | null
    | {
        AssignedTo: string | null;
        FullName: string;
      };
  Notes?: Array<string> | undefined;
  FulfillmentType?: undefined | FulfillmentTypes;
  Delivery?: undefined | DeliveryTypes;
  ShippingAddress?: {
    City: string;
    Country: string;
    State: string;
    Street1: string;
    Street2?: string;
    Zip: string;
    AddressName: string;
    FirstName: string;
    LastName: string;
    Phone: string;
    CompanyName?: string;
  };
  Subscription?: OrderXpSubscription | null;
  PaymentIntent?: string;
};

export type OrderXpSubscription = {
  Id?: string;
  Frequency: number;
  Interval: SubscriptionInterval;
  Active?: boolean;
};

export type ShippingXp = {};

export type LineItemXp = {
  Picked: undefined | boolean;
  Subscription: undefined | boolean;
};

export type PaymentXp = {
  PO: undefined | string;
};

export type MeXp = {
  SavedCarts?: {
    [key: string]: string;
  };
  Avatar?: string;
  StripeUserId?: string;
};

export type BillingAddressXp = AddressXp & {
  ShippingAddress?: Address<any>;
};

export type AddressXp = {
  Primary?: boolean;
  ForWebsite?: boolean;
};

export type VariantXp = {
  Images: Array<string>;
  Thumbnails: Array<string>;
  Sizes: Array<string>;
  Colors: Array<string>;
  Tags: Array<string>;
  Suggestions: Array<string>;
  Brand: string;
  Availability: string;
  DiscountPercentage: number;
  StyleNumber: string;
  Details: string;
  Activities: Array<string>;
  AgeGroup: Array<string>;
  Gender: Array<string>;
  SimilarItems: Array<string>;
  TypesOfUse: Array<string>;
  Room: Array<string>;
  GiftFinder: {
    Occaision: Array<string>;
    Personality: Array<string>;
    Recipient: Array<string>;
  };
  LongDescription: string | null;
  IsDiscounted: "No" | "Yes";
};

export type ProductXp = VariantXp & {
  OriginalPrice: number;
  Price: number;
  Ranking: number;
  Views: number;
  NumberOfReviews: number;
  Categories: Array<string>;
};

export type Category = {
  CategoryId: string;
  Name: string;
};

export type FeaturedCategory = {
  id: string;
  name: string;
  icon?: string;
  image: string;
  slug: string;
  parent?: Array<string>;
  description?: string;
};

export type SubscriptionXp = {
  Orders: Array<string>;
  FutureUsage: string;
  Token: string;
  Id: string;
};

export type SupplierXp = {
  Name: string;
  Use: boolean;
  ProfilePicture: string;
  Address: string;
  Phone: string;
  Email: string;
  Socials: Array<SocialLinks>;
  StorePageItems: StorePageItems;
  FeaturedCategories: Array<string>;
  MainCarousel: Array<{ id: string; title: string }>;
};

export type StorePageItems = {
  searchTerm: string;
  filters: Array<StorePageItem>;
};
export type SocialLinks = { name: string; url: string };
export type StorePageItem = { name: string; value: string };

export type FulfillmentTypes = "PickUp" | "Delivery";
export type DeliveryTypes = "OutForDelivery" | "Delivered";

export type ProductListOptions = {
  catalogID?: string;
  categoryID?: string;
  supplierID?: string;
  search?: string;
  searchOn?: Searchable<"Products.List">;
  searchType?: SearchType;
  sortBy?: Sortable<"Products.List">;
  page?: number;
  pageSize?: number;
  filters?: Filters;
};

export type SupplierListOptions = {
  search?: string;
  searchOn?: Searchable<"Suppliers.List">;
  sortBy?: Sortable<"Suppliers.List">;
  page?: number;
  pageSize?: number;
  filters?: Filters;
};

export type CategoryListOptions = {
  depth?: string;
  search?: string;
  searchOn?: Searchable<"Categories.List">;
  sortBy?: Sortable<"Categories.List">;
  page?: number;
  pageSize?: number;
  filters?: Filters;
};

export type MyProductOptions = {
  sellerID?: string;
};

export type SupplierAddressXp = {
  lat: number;
  long: number;
  openingHours: Array<AddressOpeningHours>;
};

export type AddressOpeningHours = {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  closedAllDay: boolean;
  start: string;
  finish: string;
};

export type MappedVariant = { value: string; label: string; price: number };

export type OrderStatus =
  | "NotStarted"
  | "InProgress"
  | "Picked"
  | "OnHold"
  | "Completed"
  | "Cancelled";
