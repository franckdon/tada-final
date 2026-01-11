// src/context/audiences/filters.catalog.ts
export type FilterType = "select" | "multiSelect" | "freeText";

export type FilterOptionDef = {
  value: string;
  labelKey: string;
};

export type FilterDef = {
  id: string;
  labelKey: string;
  type: FilterType;
  options?: FilterOptionDef[];
};

export type FilterGroupDef = {
  id: string;
  labelKey: string;
  filters: FilterDef[];
};

export const FILTER_GROUPS_CATALOG: FilterGroupDef[] = [
  {
    id: "personal_info",
    labelKey: "filters.groups.personal_info.label",
    filters: [
      {
        id: "gender",
        labelKey: "filters.groups.personal_info.filters.gender.label",
        type: "multiSelect",
        options: [
          { value: "male", labelKey: "filters.options.gender.male" },
          { value: "female", labelKey: "filters.options.gender.female" },
        ],
      },
      {
        id: "age",
        labelKey: "filters.groups.personal_info.filters.age.label",
        type: "multiSelect",
        options: [
          { value: "18-24", labelKey: "filters.options.age.years_18_24" },
          { value: "25-34", labelKey: "filters.options.age.years_25_34" },
          { value: "35-44", labelKey: "filters.options.age.years_35_44" },
          { value: "45-54", labelKey: "filters.options.age.years_45_54" },
          { value: "55+", labelKey: "filters.options.age.years_55_plus" },
        ],
      },
      {
        id: "marital_status",
        labelKey: "filters.groups.personal_info.filters.marital_status.label",
        type: "multiSelect",
        options: [
          { value: "single", labelKey: "filters.options.marital_status.single" },
          { value: "married", labelKey: "filters.options.marital_status.married" },
          { value: "divorced", labelKey: "filters.options.marital_status.divorced" },
          { value: "widowed", labelKey: "filters.options.marital_status.widowed" },
        ],
      },
      {
        id: "has_children",
        labelKey: "filters.groups.personal_info.filters.has_children.label",
        type: "multiSelect",
        options: [
            { value: "no_children", labelKey: "filters.options.has_children.no_children" },
            { value: "1_child", labelKey: "filters.options.has_children.child_1" },
            { value: "2_children", labelKey: "filters.options.has_children.children_2" },
            { value: "3+_children", labelKey: "filters.options.has_children.children_3_plus" },
        ]
      },
      {
       id: "nationality",
          labelKey: "filters.groups.personal_info.filters.nationality.label",
          type: "multiSelect",
          options: [
            { value: "ivory_coast", labelKey: "filters.options.nationality.ivory_coast" },
            { value: "senegal", labelKey: "filters.options.nationality.senegal" },
            { value: "cameroon", labelKey: "filters.options.nationality.cameroon" },
            { value: "nigeria", labelKey: "filters.options.nationality.nigeria" },
            { value: "ghana", labelKey: "filters.options.nationality.ghana" },
            { value: "other_africa", labelKey: "filters.options.nationality.other_africa" },
            { value: "other", labelKey: "filters.options.nationality.other" },
          ],
      },
    ],
  },
  {
      id: "location",
      labelKey: "filters.groups.location.label",
      filters: [
        {
          id: "country",
          labelKey: "filters.groups.location.filters.country.label",
          type: "multiSelect",
          options: [
            { value: "ivory_coast", labelKey: "filters.options.country.ivory_coast" },
            { value: "senegal", labelKey: "filters.options.country.senegal" },
            { value: "cameroon", labelKey: "filters.options.country.cameroon" },
            { value: "nigeria", labelKey: "filters.options.country.nigeria" },
            { value: "ghana", labelKey: "filters.options.country.ghana" },
            { value: "other_africa", labelKey: "filters.options.country.other_africa" },
            { value: "europe", labelKey: "filters.options.country.europe" },
            { value: "north_america", labelKey: "filters.options.country.north_america" },
            { value: "other", labelKey: "filters.options.country.other" },
          ],
        },
        {
          id: "city",
          labelKey: "filters.groups.location.filters.city.label",
          type: "multiSelect",
          options: [
            { value: "abidjan", labelKey: "filters.options.city.abidjan" },
            { value: "dakar", labelKey: "filters.options.city.dakar" },
            { value: "yaounde", labelKey: "filters.options.city.yaounde" },
            { value: "douala", labelKey: "filters.options.city.douala" },
            { value: "lagos", labelKey: "filters.options.city.lagos" },
            { value: "accra", labelKey: "filters.options.city.accra" },
            { value: "other", labelKey: "filters.options.city.other" },
          ],
        },
        {
          id: "neighborhood",
          labelKey: "filters.groups.location.filters.neighborhood.label",
          type: "freeText",
        },
        {
          id: "residential_density",
          labelKey: "filters.groups.location.filters.residential_density.label",
          type: "multiSelect",
          options: [
            { value: "high", labelKey: "filters.options.residential_density.high" },
            { value: "medium", labelKey: "filters.options.residential_density.medium" },
            { value: "low", labelKey: "filters.options.residential_density.low" },
          ],
        },
        {
          id: "area_type",
          labelKey: "filters.groups.location.filters.area_type.label",
          type: "multiSelect",
          options: [
            { value: "urban", labelKey: "filters.options.area_type.urban" },
            { value: "rural", labelKey: "filters.options.area_type.rural" },
            { value: "suburban", labelKey: "filters.options.area_type.suburban" },
          ],
        },
        {
          id: "residence_duration",
          labelKey: "filters.groups.location.filters.residence_duration.label",
          type: "multiSelect",
          options: [
            { value: "less_than_1", labelKey: "filters.options.residence_duration.less_than_1" },
            { value: "1_to_3", labelKey: "filters.options.residence_duration.y_1_to_3" },
            { value: "3_to_5", labelKey: "filters.options.residence_duration.y_3_to_5" },
            { value: "more_than_5", labelKey: "filters.options.residence_duration.more_than_5" },
          ],
        },
      ],
    },
    {
      id: "demographics",
      labelKey: "filters.groups.demographics.label",
      filters: [
        {
          id: "education",
          labelKey: "filters.groups.demographics.filters.education.label",
          type: "multiSelect",
          options: [
            { value: "primary", labelKey: "filters.options.education.primary" },
            { value: "secondary", labelKey: "filters.options.education.secondary" },
            { value: "higher", labelKey: "filters.options.education.higher" },
            { value: "autodidact", labelKey: "filters.options.education.autodidact" },
          ],
        },
        {
          id: "diploma",
          labelKey: "filters.groups.demographics.filters.diploma.label",
          type: "multiSelect",
          options: [
            { value: "bepc", labelKey: "filters.options.diploma.bepc" },
            { value: "bac", labelKey: "filters.options.diploma.bac" },
            { value: "bachelor", labelKey: "filters.options.diploma.bachelor" },
            { value: "master", labelKey: "filters.options.diploma.master" },
            { value: "phd", labelKey: "filters.options.diploma.phd" },
            { value: "other", labelKey: "filters.options.diploma.other" },
          ],
        },
        {
          id: "languages",
          labelKey: "filters.groups.demographics.filters.languages.label",
          type: "multiSelect",
          options: [
            { value: "french", labelKey: "filters.options.languages.french" },
            { value: "english", labelKey: "filters.options.languages.english" },
            { value: "arabic", labelKey: "filters.options.languages.arabic" },
            { value: "ethnic_language", labelKey: "filters.options.languages.ethnic_language" },
            { value: "other", labelKey: "filters.options.languages.other" },
          ],
        },
        {
          id: "religion",
          labelKey: "filters.groups.demographics.filters.religion.label",
          type: "multiSelect",
          options: [
            { value: "islam", labelKey: "filters.options.religion.islam" },
            { value: "christianity", labelKey: "filters.options.religion.christianity" },
            { value: "animism", labelKey: "filters.options.religion.animism" },
            { value: "none", labelKey: "filters.options.religion.none" },
            { value: "other", labelKey: "filters.options.religion.other" },
          ],
        },
        {
          id: "ethnicity",
          labelKey: "filters.groups.demographics.filters.ethnicity.label",
          type: "multiSelect",
          options: [
            { value: "akan", labelKey: "filters.options.ethnicity.akan" },
            { value: "krou", labelKey: "filters.options.ethnicity.krou" },
            { value: "mande", labelKey: "filters.options.ethnicity.mande" },
            { value: "peul", labelKey: "filters.options.ethnicity.peul" },
            { value: "wolof", labelKey: "filters.options.ethnicity.wolof" },
            { value: "other", labelKey: "filters.options.ethnicity.other" },
          ],
        },
      ],
    },
    {
      id: "professional",
      labelKey: "filters.groups.professional.label",
      filters: [
        {
          id: "sector",
          labelKey: "filters.groups.professional.filters.sector.label",
          type: "multiSelect",
          options: [
            { value: "commerce", labelKey: "filters.options.professional.sector.commerce" },
            { value: "education", labelKey: "filters.options.professional.sector.education" },
            { value: "health", labelKey: "filters.options.professional.sector.health" },
            { value: "transport", labelKey: "filters.options.professional.sector.transport" },
            { value: "technology", labelKey: "filters.options.professional.sector.technology" },
            { value: "other", labelKey: "filters.options.professional.sector.other" },
          ],
        },
        {
          id: "professional_status",
          labelKey: "filters.groups.professional.filters.professional_status.label",
          type: "multiSelect",
          options: [
            { value: "employee", labelKey: "filters.options.professional.professional_status.employee" },
            { value: "independent", labelKey: "filters.options.professional.professional_status.independent" },
            { value: "unemployed", labelKey: "filters.options.professional.professional_status.unemployed" },
            { value: "student", labelKey: "filters.options.professional.professional_status.student" },
            { value: "retired", labelKey: "filters.options.professional.professional_status.retired" },
          ],
        },
        {
          id: "work_time",
          labelKey: "filters.groups.professional.filters.work_time.label",
          type: "multiSelect",
          options: [
            { value: "full_time", labelKey: "filters.options.professional.work_time.full_time" },
            { value: "part_time", labelKey: "filters.options.professional.work_time.part_time" },
            { value: "freelance", labelKey: "filters.options.professional.work_time.freelance" },
          ],
        },
        {
          id: "work_experience",
          labelKey: "filters.groups.professional.filters.work_experience.label",
          type: "multiSelect",
          options: [
            { value: "less_than_1", labelKey: "filters.options.professional.work_experience.less_than_1" },
            { value: "1_to_3", labelKey: "filters.options.professional.work_experience.y_1_to_3" },
            { value: "3_to_5", labelKey: "filters.options.professional.work_experience.y_3_to_5" },
            { value: "more_than_5", labelKey: "filters.options.professional.work_experience.more_than_5" },
          ],
        },
        {
          id: "work_environment",
          labelKey: "filters.groups.professional.filters.work_environment.label",
          type: "multiSelect",
          options: [
            { value: "office", labelKey: "filters.options.professional.work_environment.office" },
            { value: "field", labelKey: "filters.options.professional.work_environment.field" },
            { value: "remote", labelKey: "filters.options.professional.work_environment.remote" },
            { value: "hybrid", labelKey: "filters.options.professional.work_environment.hybrid" },
          ],
        },
      ],
    },
    {
      id: "financial",
      labelKey: "filters.groups.financial.label",
      filters: [
        {
          id: "income",
          labelKey: "filters.groups.financial.filters.income.label",
          type: "multiSelect",
          options: [
            { value: "less_than_50k", labelKey: "filters.options.financial.income.less_than_50k" },
            { value: "50k_to_200k", labelKey: "filters.options.financial.income.m_to_200k" },
            { value: "200k_to_500k", labelKey: "filters.options.financial.income.m_to_500k" },
            { value: "more_than_500k", labelKey: "filters.options.financial.income.more_than_500k" },
          ],
        },
        {
          id: "income_source",
          labelKey: "filters.groups.financial.filters.income_source.label",
          type: "multiSelect",
          options: [
            { value: "salary", labelKey: "filters.options.financial.income_source.salary" },
            { value: "commerce", labelKey: "filters.options.financial.income_source.commerce" },
            { value: "freelance", labelKey: "filters.options.financial.income_source.freelance" },
            { value: "savings", labelKey: "filters.options.financial.income_source.savings" },
            { value: "other", labelKey: "filters.options.financial.income_source.other" },
          ],
        },
        {
          id: "bank_account",
          labelKey: "filters.groups.financial.filters.bank_account.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.financial.bank_account.yes" },
            { value: "no", labelKey: "filters.options.financial.bank_account.no" },
          ],
        },
        {
          id: "mobile_money",
          labelKey: "filters.groups.financial.filters.mobile_money.label",
          type: "multiSelect",
          options: [
            { value: "orange_money", labelKey: "filters.options.financial.mobile_money.orange_money" },
            { value: "mtn_money", labelKey: "filters.options.financial.mobile_money.mtn_money" },
            { value: "moov_money", labelKey: "filters.options.financial.mobile_money.moov_money" },
            { value: "other", labelKey: "filters.options.financial.mobile_money.other" },
            { value: "none", labelKey: "filters.options.financial.mobile_money.none" },
          ],
        },
        {
          id: "budget_sufficiency",
          labelKey: "filters.groups.financial.filters.budget_sufficiency.label",
          type: "multiSelect",
          options: [
            { value: "always", labelKey: "filters.options.financial.budget_sufficiency.always" },
            { value: "often", labelKey: "filters.options.financial.budget_sufficiency.often" },
            { value: "sometimes", labelKey: "filters.options.financial.budget_sufficiency.sometimes" },
            { value: "rarely", labelKey: "filters.options.financial.budget_sufficiency.rarely" },
            { value: "never", labelKey: "filters.options.financial.budget_sufficiency.never" },
          ],
        },
      ],
    },
    {
      id: "equipment",
      labelKey: "filters.groups.equipment.label",
      filters: [
        {
          id: "phone_type",
          labelKey: "filters.groups.equipment.filters.phone_type.label",
          type: "multiSelect",
          options: [
            { value: "android", labelKey: "filters.options.equipment.phone_type.android" },
            { value: "iphone", labelKey: "filters.options.equipment.phone_type.iphone" },
            { value: "other", labelKey: "filters.options.equipment.phone_type.other" },
          ],
        },
        {
          id: "has_computer",
          labelKey: "filters.groups.equipment.filters.has_computer.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.equipment.has_computer.yes" },
            { value: "no", labelKey: "filters.options.equipment.has_computer.no" },
          ],
        },
        {
          id: "internet_connection",
          labelKey: "filters.groups.equipment.filters.internet_connection.label",
          type: "multiSelect",
          options: [
            { value: "home", labelKey: "filters.options.equipment.internet_connection.home" },
            { value: "mobile", labelKey: "filters.options.equipment.internet_connection.mobile" },
            { value: "both", labelKey: "filters.options.equipment.internet_connection.both" },
            { value: "none", labelKey: "filters.options.equipment.internet_connection.none" },
          ],
        },
        {
          id: "internet_provider",
          labelKey: "filters.groups.equipment.filters.internet_provider.label",
          type: "multiSelect",
          options: [
            { value: "orange", labelKey: "filters.options.equipment.internet_provider.orange" },
            { value: "mtn", labelKey: "filters.options.equipment.internet_provider.mtn" },
            { value: "moov", labelKey: "filters.options.equipment.internet_provider.moov" },
            { value: "other", labelKey: "filters.options.equipment.internet_provider.other" },
          ],
        },
        {
          id: "connected_devices",
          labelKey: "filters.groups.equipment.filters.connected_devices.label",
          type: "multiSelect",
          options: [
            { value: "smartwatch", labelKey: "filters.options.equipment.connected_devices.smartwatch" },
            { value: "smart_tv", labelKey: "filters.options.equipment.connected_devices.smart_tv" },
            { value: "home_automation", labelKey: "filters.options.equipment.connected_devices.home_automation" },
            { value: "other", labelKey: "filters.options.equipment.connected_devices.other" },
            { value: "none", labelKey: "filters.options.equipment.connected_devices.none" },
          ],
        },
      ],
    },
    {
      id: "consumption",
      labelKey: "filters.groups.consumption.label",
      filters: [
        {
          id: "shopping_frequency",
          labelKey: "filters.groups.consumption.filters.shopping_frequency.label",
          type: "multiSelect",
          options: [
            { value: "daily", labelKey: "filters.options.consumption.shopping_frequency.daily" },
            { value: "weekly", labelKey: "filters.options.consumption.shopping_frequency.weekly" },
            { value: "monthly", labelKey: "filters.options.consumption.shopping_frequency.monthly" },
            { value: "less", labelKey: "filters.options.consumption.shopping_frequency.less" },
          ],
        },
        {
          id: "shopping_location",
          labelKey: "filters.groups.consumption.filters.shopping_location.label",
          type: "multiSelect",
          options: [
            { value: "market", labelKey: "filters.options.consumption.shopping_location.market" },
            { value: "supermarket", labelKey: "filters.options.consumption.shopping_location.supermarket" },
            { value: "local_shop", labelKey: "filters.options.consumption.shopping_location.local_shop" },
            { value: "online", labelKey: "filters.options.consumption.shopping_location.online" },
          ],
        },
        {
          id: "online_shopping",
          labelKey: "filters.groups.consumption.filters.online_shopping.label",
          type: "multiSelect",
          options: [
            { value: "regular", labelKey: "filters.options.consumption.online_shopping.regular" },
            { value: "occasional", labelKey: "filters.options.consumption.online_shopping.occasional" },
            { value: "never", labelKey: "filters.options.consumption.online_shopping.never" },
          ],
        },
        {
          id: "brand_loyalty",
          labelKey: "filters.groups.consumption.filters.brand_loyalty.label",
          type: "multiSelect",
          options: [
            { value: "very_loyal", labelKey: "filters.options.consumption.brand_loyalty.very_loyal" },
            { value: "somewhat_loyal", labelKey: "filters.options.consumption.brand_loyalty.somewhat_loyal" },
            { value: "not_loyal", labelKey: "filters.options.consumption.brand_loyalty.not_loyal" },
          ],
        },
        {
          id: "purchase_motivation",
          labelKey: "filters.groups.consumption.filters.purchase_motivation.label",
          type: "multiSelect",
          options: [
            { value: "price", labelKey: "filters.options.consumption.purchase_motivation.price" },
            { value: "quality", labelKey: "filters.options.consumption.purchase_motivation.quality" },
            { value: "brand", labelKey: "filters.options.consumption.purchase_motivation.brand" },
            { value: "reviews", labelKey: "filters.options.consumption.purchase_motivation.reviews" },
            { value: "advertising", labelKey: "filters.options.consumption.purchase_motivation.advertising" },
            { value: "availability", labelKey: "filters.options.consumption.purchase_motivation.availability" },
          ],
        },
      ],
    },
    {
      id: "lifestyle",
      labelKey: "filters.groups.lifestyle.label",
      filters: [
        {
          id: "transport_mode",
          labelKey: "filters.groups.lifestyle.filters.transport_mode.label",
          type: "multiSelect",
          options: [
            { value: "public_transport", labelKey: "filters.options.lifestyle.transport_mode.public_transport" },
            { value: "personal_vehicle", labelKey: "filters.options.lifestyle.transport_mode.personal_vehicle" },
            { value: "motorcycle", labelKey: "filters.options.lifestyle.transport_mode.motorcycle" },
            { value: "vtc", labelKey: "filters.options.lifestyle.transport_mode.vtc" },
            { value: "walking", labelKey: "filters.options.lifestyle.transport_mode.walking" },
          ],
        },
        {
          id: "housing",
          labelKey: "filters.groups.lifestyle.filters.housing.label",
          type: "multiSelect",
          options: [
            { value: "apartment", labelKey: "filters.options.lifestyle.housing.apartment" },
            { value: "house", labelKey: "filters.options.lifestyle.housing.house" },
            { value: "studio", labelKey: "filters.options.lifestyle.housing.studio" },
            { value: "villa", labelKey: "filters.options.lifestyle.housing.villa" },
          ],
        },
        {
          id: "housing_status",
          labelKey: "filters.groups.lifestyle.filters.housing_status.label",
          type: "multiSelect",
          options: [
            { value: "rent", labelKey: "filters.options.lifestyle.housing_status.rent" },
            { value: "own", labelKey: "filters.options.lifestyle.housing_status.own" },
            { value: "free", labelKey: "filters.options.lifestyle.housing_status.free" },
            { value: "colocation", labelKey: "filters.options.lifestyle.housing_status.colocation" },
          ],
        },
        {
          id: "sport",
          labelKey: "filters.groups.lifestyle.filters.sport.label",
          type: "multiSelect",
          options: [
            { value: "regular", labelKey: "filters.options.lifestyle.sport.regular" },
            { value: "occasional", labelKey: "filters.options.lifestyle.sport.occasional" },
            { value: "never", labelKey: "filters.options.lifestyle.sport.never" },
          ],
        },
        {
          id: "travel",
          labelKey: "filters.groups.lifestyle.filters.travel.label",
          type: "multiSelect",
          options: [
            { value: "frequent", labelKey: "filters.options.lifestyle.travel.frequent" },
            { value: "occasional", labelKey: "filters.options.lifestyle.travel.occasional" },
            { value: "rare", labelKey: "filters.options.lifestyle.travel.rare" },
            { value: "never", labelKey: "filters.options.lifestyle.travel.never" },
          ],
        },
      ],
    },
    {
      id: "media",
      labelKey: "filters.groups.media.label",
      filters: [
        {
          id: "social_media",
          labelKey: "filters.groups.media.filters.social_media.label",
          type: "multiSelect",
          options: [
            { value: "facebook", labelKey: "filters.options.media.social_media.facebook" },
            { value: "instagram", labelKey: "filters.options.media.social_media.instagram" },
            { value: "tiktok", labelKey: "filters.options.media.social_media.tiktok" },
            { value: "twitter", labelKey: "filters.options.media.social_media.twitter" },
            { value: "linkedin", labelKey: "filters.options.media.social_media.linkedin" },
            { value: "snapchat", labelKey: "filters.options.media.social_media.snapchat" },
            { value: "youtube", labelKey: "filters.options.media.social_media.youtube" },
            { value: "whatsapp", labelKey: "filters.options.media.social_media.whatsapp" },
            { value: "telegram", labelKey: "filters.options.media.social_media.telegram" },
          ],
        },
        {
          id: "social_media_time",
          labelKey: "filters.groups.media.filters.social_media_time.label",
          type: "multiSelect",
          options: [
            { value: "less_than_30min", labelKey: "filters.options.media.social_media_time.less_than_30min" },
            { value: "30min_to_1h", labelKey: "filters.options.media.social_media_time.time_to_1h" },
            { value: "1h_to_2h", labelKey: "filters.options.media.social_media_time.time_to_2h" },
            { value: "more_than_2h", labelKey: "filters.options.media.social_media_time.more_than_2h" },
          ],
        },
        {
          id: "communication_means",
          labelKey: "filters.groups.media.filters.communication_means.label",
          type: "multiSelect",
          options: [
            { value: "calls", labelKey: "filters.options.media.communication_means.calls" },
            { value: "sms", labelKey: "filters.options.media.communication_means.sms" },
            { value: "whatsapp", labelKey: "filters.options.media.communication_means.whatsapp" },
            { value: "messenger", labelKey: "filters.options.media.communication_means.messenger" },
            { value: "email", labelKey: "filters.options.media.communication_means.email" },
          ],
        },
        {
          id: "entertainment",
          labelKey: "filters.groups.media.filters.entertainment.label",
          type: "multiSelect",
          options: [
            { value: "movies", labelKey: "filters.options.media.entertainment.movies" },
            { value: "series", labelKey: "filters.options.media.entertainment.series" },
            { value: "music", labelKey: "filters.options.media.entertainment.music" },
            { value: "videos", labelKey: "filters.options.media.entertainment.videos" },
            { value: "video_games", labelKey: "filters.options.media.entertainment.video_games" },
            { value: "shows", labelKey: "filters.options.media.entertainment.shows" },
          ],
        },
        {
          id: "streaming",
          labelKey: "filters.groups.media.filters.streaming.label",
          type: "multiSelect",
          options: [
            { value: "netflix", labelKey: "filters.options.media.streaming.netflix" },
            { value: "amazon", labelKey: "filters.options.media.streaming.amazon" },
            { value: "disney", labelKey: "filters.options.media.streaming.disney" },
            { value: "other", labelKey: "filters.options.media.streaming.other" },
            { value: "none", labelKey: "filters.options.media.streaming.none" },
          ],
        },
      ],
    },
    {
      id: "animals",
      labelKey: "filters.groups.animals.label",
      filters: [
        {
          id: "pet_types",
          labelKey: "filters.groups.animals.filters.pet_types.label",
          type: "multiSelect",
          options: [
            { value: "dog", labelKey: "filters.options.animals.pet_types.dog" },
            { value: "cat", labelKey: "filters.options.animals.pet_types.cat" },
            { value: "bird", labelKey: "filters.options.animals.pet_types.bird" },
            { value: "other", labelKey: "filters.options.animals.pet_types.other" },
          ],
        },
        {
          id: "pet_count",
          labelKey: "filters.groups.animals.filters.pet_count.label",
          type: "multiSelect",
          options: [
            { value: "1", labelKey: "filters.options.animals.pet_count.one_1" },
            { value: "2", labelKey: "filters.options.animals.pet_count.two_2" },
            { value: "3", labelKey: "filters.options.animals.pet_count.three_3" },
            { value: "4+", labelKey: "filters.options.animals.pet_count.four_plus_4" },
          ],
        },
        {
          id: "pet_food_location",
          labelKey: "filters.groups.animals.filters.pet_food_location.label",
          type: "multiSelect",
          options: [
            { value: "home", labelKey: "filters.options.animals.pet_food_location.home" },
            { value: "outside", labelKey: "filters.options.animals.pet_food_location.outside" },
            { value: "other", labelKey: "filters.options.animals.pet_food_location.other" },
          ],
        },
        {
          id: "vet_frequency",
          labelKey: "filters.groups.animals.filters.vet_frequency.label",
          type: "multiSelect",
          options: [
            { value: "monthly", labelKey: "filters.options.animals.vet_frequency.monthly" },
            { value: "quarterly", labelKey: "filters.options.animals.vet_frequency.quarterly" },
            { value: "biannual", labelKey: "filters.options.animals.vet_frequency.biannual" },
            { value: "annual", labelKey: "filters.options.animals.vet_frequency.annual" },
            { value: "as_needed", labelKey: "filters.options.animals.vet_frequency.as_needed" },
          ],
        },
        {
          id: "pet_expenses",
          labelKey: "filters.groups.animals.filters.pet_expenses.label",
          type: "multiSelect",
          options: [
            { value: "food", labelKey: "filters.options.animals.pet_expenses.food" },
            { value: "care", labelKey: "filters.options.animals.pet_expenses.care" },
            { value: "accessories", labelKey: "filters.options.animals.pet_expenses.accessories" },
            { value: "other", labelKey: "filters.options.animals.pet_expenses.other" },
          ],
        },
        {
          id: "pet_specialized_products",
          labelKey: "filters.groups.animals.filters.pet_specialized_products.label",
          type: "multiSelect",
          options: [
            { value: "shampoo", labelKey: "filters.options.animals.pet_specialized_products.shampoo" },
            { value: "brushes", labelKey: "filters.options.animals.pet_specialized_products.brushes" },
            { value: "toys", labelKey: "filters.options.animals.pet_specialized_products.toys" },
            { value: "other", labelKey: "filters.options.animals.pet_specialized_products.other" },
          ],
        },
        {
          id: "pet_food_behavior",
          labelKey: "filters.groups.animals.filters.pet_food_behavior.label",
          type: "multiSelect",
          options: [
            { value: "industrial", labelKey: "filters.options.animals.pet_food_behavior.industrial" },
            { value: "homemade", labelKey: "filters.options.animals.pet_food_behavior.homemade" },
          ],
        },
        {
          id: "pet_training",
          labelKey: "filters.groups.animals.filters.pet_training.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.animals.pet_training.yes" },
            { value: "no", labelKey: "filters.options.animals.pet_training.no" },
          ],
        },
        {
          id: "pet_cleanliness",
          labelKey: "filters.groups.animals.filters.pet_cleanliness.label",
          type: "multiSelect",
          options: [
            { value: "toilet", labelKey: "filters.options.animals.pet_cleanliness.toilet" },
            { value: "regular_care", labelKey: "filters.options.animals.pet_cleanliness.regular_care" },
            { value: "other", labelKey: "filters.options.animals.pet_cleanliness.other" },
          ],
        },
      ],
    },
    {
      id: "social_engagement",
      labelKey: "filters.groups.social_engagement.label",
      filters: [
        {
          id: "volunteering",
          labelKey: "filters.groups.social_engagement.filters.volunteering.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.social_engagement.volunteering.yes" },
            { value: "no", labelKey: "filters.options.social_engagement.volunteering.no" },
          ],
        },
        {
          id: "organization_member",
          labelKey: "filters.groups.social_engagement.filters.organization_member.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.social_engagement.organization_member.yes" },
            { value: "no", labelKey: "filters.options.social_engagement.organization_member.no" },
          ],
        },
        {
          id: "supported_causes",
          labelKey: "filters.groups.social_engagement.filters.supported_causes.label",
          type: "multiSelect",
          options: [
            { value: "environment", labelKey: "filters.options.social_engagement.supported_causes.environment" },
            { value: "education", labelKey: "filters.options.social_engagement.supported_causes.education" },
            { value: "human_rights", labelKey: "filters.options.social_engagement.supported_causes.human_rights" },
            { value: "other", labelKey: "filters.options.social_engagement.supported_causes.other" },
          ],
        },
        {
          id: "charity_events",
          labelKey: "filters.groups.social_engagement.filters.charity_events.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.social_engagement.charity_events.yes" },
            { value: "no", labelKey: "filters.options.social_engagement.charity_events.no" },
          ],
        },
        {
          id: "regular_donations",
          labelKey: "filters.groups.social_engagement.filters.regular_donations.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.social_engagement.regular_donations.yes" },
            { value: "no", labelKey: "filters.options.social_engagement.regular_donations.no" },
          ],
        },
        {
          id: "volunteering_frequency",
          labelKey: "filters.groups.social_engagement.filters.volunteering_frequency.label",
          type: "multiSelect",
          options: [
            { value: "weekly", labelKey: "filters.options.social_engagement.volunteering_frequency.weekly" },
            { value: "monthly", labelKey: "filters.options.social_engagement.volunteering_frequency.monthly" },
            { value: "quarterly", labelKey: "filters.options.social_engagement.volunteering_frequency.quarterly" },
            { value: "annual", labelKey: "filters.options.social_engagement.volunteering_frequency.annual" },
          ],
        },
        {
          id: "fundraising_organization",
          labelKey: "filters.groups.social_engagement.filters.fundraising_organization.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.social_engagement.fundraising_organization.yes" },
            { value: "no", labelKey: "filters.options.social_engagement.fundraising_organization.no" },
          ],
        },
        {
          id: "social_impact_consumption",
          labelKey: "filters.groups.social_engagement.filters.social_impact_consumption.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.social_engagement.social_impact_consumption.yes" },
            { value: "no", labelKey: "filters.options.social_engagement.social_impact_consumption.no" },
          ],
        },
        {
          id: "social_platforms",
          labelKey: "filters.groups.social_engagement.filters.social_platforms.label",
          type: "multiSelect",
          options: [
            { value: "social_media", labelKey: "filters.options.social_engagement.social_platforms.social_media" },
            { value: "forums", labelKey: "filters.options.social_engagement.social_platforms.forums" },
            { value: "other", labelKey: "filters.options.social_engagement.social_platforms.other" },
          ],
        },
      ],
    },
    {
      id: "environment",
      labelKey: "filters.groups.environment.label",
      filters: [
        {
          id: "waste_sorting",
          labelKey: "filters.groups.environment.filters.waste_sorting.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.environment.waste_sorting.yes" },
            { value: "no", labelKey: "filters.options.environment.waste_sorting.no" },
          ],
        },
        {
          id: "eco_products",
          labelKey: "filters.groups.environment.filters.eco_products.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.environment.eco_products.yes" },
            { value: "no", labelKey: "filters.options.environment.eco_products.no" },
          ],
        },
        {
          id: "green_space",
          labelKey: "filters.groups.environment.filters.green_space.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.environment.green_space.yes" },
            { value: "no", labelKey: "filters.options.environment.green_space.no" },
          ],
        },
        {
          id: "reusable_products",
          labelKey: "filters.groups.environment.filters.reusable_products.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.environment.reusable_products.yes" },
            { value: "no", labelKey: "filters.options.environment.reusable_products.no" },
          ],
        },
        {
          id: "energy_saving",
          labelKey: "filters.groups.environment.filters.energy_saving.label",
          type: "multiSelect",
          options: [
            { value: "solar_panels", labelKey: "filters.options.environment.energy_saving.solar_panels" },
            { value: "led", labelKey: "filters.options.environment.energy_saving.led" },
            { value: "other", labelKey: "filters.options.environment.energy_saving.other" },
          ],
        },
        {
          id: "sustainable_transport",
          labelKey: "filters.groups.environment.filters.sustainable_transport.label",
          type: "multiSelect",
          options: [
            { value: "carpooling", labelKey: "filters.options.environment.sustainable_transport.carpooling" },
            { value: "public_transport", labelKey: "filters.options.environment.sustainable_transport.public_transport" },
            { value: "bike", labelKey: "filters.options.environment.sustainable_transport.bike" },
          ],
        },
        {
          id: "local_food",
          labelKey: "filters.groups.environment.filters.local_food.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.environment.local_food.yes" },
            { value: "no", labelKey: "filters.options.environment.local_food.no" },
          ],
        },
        {
          id: "composting",
          labelKey: "filters.groups.environment.filters.composting.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.environment.composting.yes" },
            { value: "no", labelKey: "filters.options.environment.composting.no" },
          ],
        },
        {
          id: "public_space_cleaning",
          labelKey: "filters.groups.environment.filters.public_space_cleaning.label",
          type: "multiSelect",
          options: [
            { value: "never", labelKey: "filters.options.environment.public_space_cleaning.never" },
            { value: "monthly", labelKey: "filters.options.environment.public_space_cleaning.monthly" },
            { value: "multiple_monthly", labelKey: "filters.options.environment.public_space_cleaning.multiple_monthly" },
          ],
        },
        {
          id: "packaging_awareness",
          labelKey: "filters.groups.environment.filters.packaging_awareness.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.environment.packaging_awareness.yes" },
            { value: "no", labelKey: "filters.options.environment.packaging_awareness.no" },
          ],
        },
      ],
    },
    {
      id: "lifestyle_routines",
      labelKey: "filters.groups.lifestyle_routines.label",
      filters: [
        {
          id: "morning_routine",
          labelKey: "filters.groups.lifestyle_routines.filters.morning_routine.label",
          type: "multiSelect",
          options: [
            { value: "early_riser", labelKey: "filters.options.lifestyle_routines.morning_routine.early_riser" },
            { value: "late_riser", labelKey: "filters.options.lifestyle_routines.morning_routine.late_riser" },
            { value: "breakfast", labelKey: "filters.options.lifestyle_routines.morning_routine.breakfast" },
            { value: "exercise", labelKey: "filters.options.lifestyle_routines.morning_routine.exercise" },
          ],
        },
        {
          id: "evening_routine",
          labelKey: "filters.groups.lifestyle_routines.filters.evening_routine.label",
          type: "multiSelect",
          options: [
            { value: "early_bedtime", labelKey: "filters.options.lifestyle_routines.evening_routine.early_bedtime" },
            { value: "late_bedtime", labelKey: "filters.options.lifestyle_routines.evening_routine.late_bedtime" },
            { value: "relaxation", labelKey: "filters.options.lifestyle_routines.evening_routine.relaxation" },
            { value: "preparation", labelKey: "filters.options.lifestyle_routines.evening_routine.preparation" },
          ],
        },
        {
          id: "regular_exercise",
          labelKey: "filters.groups.lifestyle_routines.filters.regular_exercise.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.lifestyle_routines.regular_exercise.yes" },
            { value: "no", labelKey: "filters.options.lifestyle_routines.regular_exercise.no" },
          ],
        },
        {
          id: "exercise_type",
          labelKey: "filters.groups.lifestyle_routines.filters.exercise_type.label",
          type: "multiSelect",
          options: [
            { value: "running", labelKey: "filters.options.lifestyle_routines.exercise_type.running" },
            { value: "weight_training", labelKey: "filters.options.lifestyle_routines.exercise_type.weight_training" },
            { value: "yoga", labelKey: "filters.options.lifestyle_routines.exercise_type.yoga" },
            { value: "other", labelKey: "filters.options.lifestyle_routines.exercise_type.other" },
          ],
        },
        {
          id: "exercise_time",
          labelKey: "filters.groups.lifestyle_routines.filters.exercise_time.label",
          type: "multiSelect",
          options: [
            { value: "less_than_1h", labelKey: "filters.options.lifestyle_routines.exercise_time.less_than_1h" },
            { value: "1_to_3h", labelKey: "filters.options.lifestyle_routines.exercise_time.t3h" },
            { value: "3_to_5h", labelKey: "filters.options.lifestyle_routines.exercise_time.t5h" },
            { value: "more_than_5h", labelKey: "filters.options.lifestyle_routines.exercise_time.more_than_5h" },
          ],
        },
        {
          id: "diet",
          labelKey: "filters.groups.lifestyle_routines.filters.diet.label",
          type: "multiSelect",
          options: [
            { value: "vegetarian", labelKey: "filters.options.lifestyle_routines.diet.vegetarian" },
            { value: "vegan", labelKey: "filters.options.lifestyle_routines.diet.vegan" },
            { value: "omnivore", labelKey: "filters.options.lifestyle_routines.diet.omnivore" },
            { value: "other", labelKey: "filters.options.lifestyle_routines.diet.other" },
          ],
        },
        {
          id: "motivation_source",
          labelKey: "filters.groups.lifestyle_routines.filters.motivation_source.label",
          type: "multiSelect",
          options: [
            { value: "health", labelKey: "filters.options.lifestyle_routines.motivation_source.health" },
            { value: "appearance", labelKey: "filters.options.lifestyle_routines.motivation_source.appearance" },
            { value: "wellbeing", labelKey: "filters.options.lifestyle_routines.motivation_source.wellbeing" },
            { value: "other", labelKey: "filters.options.lifestyle_routines.motivation_source.other" },
          ],
        },
        {
          id: "productivity_habits",
          labelKey: "filters.groups.lifestyle_routines.filters.productivity_habits.label",
          type: "multiSelect",
          options: [
            { value: "todo_list", labelKey: "filters.options.lifestyle_routines.productivity_habits.todo_list" },
            { value: "breaks", labelKey: "filters.options.lifestyle_routines.productivity_habits.breaks" },
            { value: "meditation", labelKey: "filters.options.lifestyle_routines.productivity_habits.meditation" },
            { value: "other", labelKey: "filters.options.lifestyle_routines.productivity_habits.other" },
          ],
        },
        {
          id: "health_tracking",
          labelKey: "filters.groups.lifestyle_routines.filters.health_tracking.label",
          type: "multiSelect",
          options: [
            { value: "apps", labelKey: "filters.options.lifestyle_routines.health_tracking.apps" },
            { value: "wearables", labelKey: "filters.options.lifestyle_routines.health_tracking.wearables" },
            { value: "consultations", labelKey: "filters.options.lifestyle_routines.health_tracking.consultations" },
            { value: "none", labelKey: "filters.options.lifestyle_routines.health_tracking.none" },
          ],
        },
        {
          id: "work_life_balance",
          labelKey: "filters.groups.lifestyle_routines.filters.work_life_balance.label",
          type: "multiSelect",
          options: [
            { value: "excellent", labelKey: "filters.options.lifestyle_routines.work_life_balance.excellent" },
            { value: "good", labelKey: "filters.options.lifestyle_routines.work_life_balance.good" },
            { value: "fair", labelKey: "filters.options.lifestyle_routines.work_life_balance.fair" },
            { value: "poor", labelKey: "filters.options.lifestyle_routines.work_life_balance.poor" },
          ],
        },
      ],
    },
    {
      id: "trends_innovation",
      labelKey: "filters.groups.trends_innovation.label",
      filters: [
        {
          id: "trends_information",
          labelKey: "filters.groups.trends_innovation.filters.trends_information.label",
          type: "multiSelect",
          options: [
            { value: "social_media", labelKey: "filters.options.trends_innovation.trends_information.social_media" },
            { value: "blogs", labelKey: "filters.options.trends_innovation.trends_information.blogs" },
            { value: "podcasts", labelKey: "filters.options.trends_innovation.trends_information.podcasts" },
            { value: "events", labelKey: "filters.options.trends_innovation.trends_information.events" },
          ],
        },
        {
          id: "latest_innovation",
          labelKey: "filters.groups.trends_innovation.filters.latest_innovation.label",
          type: "freeText",
        },
        {
          id: "latest_products",
          labelKey: "filters.groups.trends_innovation.filters.latest_products.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.trends_innovation.latest_products.yes" },
            { value: "no", labelKey: "filters.options.trends_innovation.latest_products.no" },
          ],
        },
        {
          id: "trend_reaction",
          labelKey: "filters.groups.trends_innovation.filters.trend_reaction.label",
          type: "multiSelect",
          options: [
            { value: "immediate", labelKey: "filters.options.trends_innovation.trend_reaction.immediate" },
            { value: "wait", labelKey: "filters.options.trends_innovation.trend_reaction.wait" },
            { value: "ignore", labelKey: "filters.options.trends_innovation.trend_reaction.ignore" },
          ],
        },
        {
          id: "influencer_following",
          labelKey: "filters.groups.trends_innovation.filters.influencer_following.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.trends_innovation.influencer_following.yes" },
            { value: "no", labelKey: "filters.options.trends_innovation.influencer_following.no" },
          ],
        },
        {
          id: "regretted_trend",
          labelKey: "filters.groups.trends_innovation.filters.regretted_trend.label",
          type: "multiSelect",
          options: [
            { value: "products", labelKey: "filters.options.trends_innovation.regretted_trend.products" },
            { value: "fashion", labelKey: "filters.options.trends_innovation.regretted_trend.fashion" },
            { value: "technology", labelKey: "filters.options.trends_innovation.regretted_trend.technology" },
            { value: "other", labelKey: "filters.options.trends_innovation.regretted_trend.other" },
          ],
        },
        {
          id: "innovation_testing",
          labelKey: "filters.groups.trends_innovation.filters.innovation_testing.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.trends_innovation.innovation_testing.yes" },
            { value: "no", labelKey: "filters.options.trends_innovation.innovation_testing.no" },
          ],
        },
        {
          id: "tech_impact_consumption",
          labelKey: "filters.groups.trends_innovation.filters.tech_impact_consumption.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.trends_innovation.tech_impact_consumption.yes" },
            { value: "no", labelKey: "filters.options.trends_innovation.tech_impact_consumption.no" },
          ],
        },
        {
          id: "current_trend_interest",
          labelKey: "filters.groups.trends_innovation.filters.current_trend_interest.label",
          type: "multiSelect",
          options: [
            { value: "fashion", labelKey: "filters.options.trends_innovation.current_trend_interest.fashion" },
            { value: "technology", labelKey: "filters.options.trends_innovation.current_trend_interest.technology" },
            { value: "health", labelKey: "filters.options.trends_innovation.current_trend_interest.health" },
            { value: "other", labelKey: "filters.options.trends_innovation.current_trend_interest.other" },
          ],
        },
        {
          id: "innovation_participation",
          labelKey: "filters.groups.trends_innovation.filters.innovation_participation.label",
          type: "multiSelect",
          options: [
            { value: "yes", labelKey: "filters.options.trends_innovation.innovation_participation.yes" },
            { value: "no", labelKey: "filters.options.trends_innovation.innovation_participation.no" },
          ],
        },
      ],
    },
];
