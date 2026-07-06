export interface Couple {
  firstName: string
  secondName: string
  displayName: string
  fullName: string
  monogram: string
}

export interface Wedding {
  date: string
  dateShort: string
  time: string
  timeShort: string
  timezone: string
  iso: string
  displayDate: string
  location: string
  malayalamDate: string
  weekday: string
  day: number
  month: string
  year: number
}

export interface WeddingEvent {
  title: string
  date: string
  time: string
  location: string
  description: string
  mapsQuery: string
}

export interface Venue {
  name: string
  region: string
  address: string
  description: string
  details: string[]
  website: string
  mapsQuery: string
  mapsEmbedUrl: string
  directionsQuery?: string
  ical: {
    title: string
    start: string
    end: string
    location: string
    description: string
  }
  travelStay?: {
    title: string
    items: string[]
  }
}

export interface GalleryItem {
  id?: string
  src: string
  alt: string
  caption?: string
  rotation: number
}

export interface RSVP {
  successMessage?: string
  events?: string[]
  dietaryOptions?: string[]
}

export interface Verse {
  text: string
  reference?: string
}

export interface LiveStream {
  youtubeVideoId: string
  channelName: string
  channelUrl: string
  liveStartIso: string
}

export const couple: Couple = {
  firstName: 'Anjana',
  secondName: 'Krishnaprasad',
  displayName: 'Anjana & Krishnaprasad',
  fullName: 'Anjana Sivanandan & Krishnaprasad Thulasidas',
  monogram: 'A & K',
}

export const wedding: Wedding = {
  date: 'Sunday, September 13, 2026',
  dateShort: 'September 13, 2026',
  time: '10:00 AM \u2013 10:30 AM (Muhurtham)',
  timeShort: '10:00 AM',
  timezone: 'IST (UTC+5:30)',
  iso: '2026-09-13T10:00:00+05:30',
  displayDate: 'September 13, 2026',
  location: 'Cherthala, Alappuzha, Kerala',
  malayalamDate: '1202 Chingam 28',
  weekday: 'Sunday',
  day: 13,
  month: 'September',
  year: 2026,
}

export const hero = {
  preTitle: 'Together with their families',
  ctaText: 'RSVP Now',
  countdownLabel: 'Countdown to our wedding',
  image: '/hero/couple.webp',
  imageAvif: '/hero/couple.avif',
  imageAlt: 'Anjana and Krishnaprasad together in the warm light of Cherthala, Kerala',
}

export const verse: Verse = {
  text: 'The best thing to hold onto in life is each other.',
  reference: 'Audrey Hepburn',
}

export const sections = {
  story: { label: 'Watch Live', heading: 'Ceremony Live Stream' },
  events: { label: 'Join Us', heading: 'The Celebration' },
  family: { label: 'Our Families', heading: 'Honored Parents' },
  venue: { label: 'The Venue', heading: 'Our Venue' },
  gallery: { label: 'Moments', heading: 'Our Gallery' },
  rsvp: { label: 'Join Our Celebration', heading: 'RSVP' },
  countdown: { label: 'Countdown', heading: 'Countdown to Our Wedding' },
} as const

export interface FamilySide {
  label: string
  parents: string[]
  members: string[]
}

export const family: { bride: FamilySide; groom: FamilySide } = {
  bride: {
    label: 'The Bride\u2019s Family',
    parents: ['Mr. Sivannandan K.K', 'Mrs. Usha Sivanandan'],
    members: ['Vaishnav'],
  },
  groom: {
    label: 'The Groom\u2019s Family',
    parents: ['Late Mr. Thulasidas', 'Mrs. Ushakumari'],
    members: ['Krishnapriya', 'Praveen', 'Avanthika', 'Advay Krishna'],
  },
}

export const events: WeddingEvent[] = [
  {
    title: 'Wedding Ceremony',
    date: 'Sunday, September 13, 2026',
    time: '10:00 AM \u2013 10:30 AM (Muhurtham)',
    location: 'Akhilanjali Convention Centre, Varanad Rd, Cherthala, Kerala 688539',
    description:
      'A sacred Muhurtham ceremony uniting Anjana and Krishnaprasad in the presence of family and loved ones.',
    mapsQuery: 'Akhilanjali Convention Centre, Varanad Rd, near Sastham kavala, Cherthala, Nedumprakkad, Kerala 688539',
  },
  {
    title: 'Marriage Reception',
    date: 'Monday, September 14, 2026',
    time: '4:00 PM \u2013 8:00 PM',
    location: 'Janakiram Auditorium, Chelakkara, Thrissur, Kerala',
    description:
      "A celebration with the groom's family in Chelakkara. Hosted by Krishnapriya, Praveen, Avanthika and Advay Krishna.",
    mapsQuery: 'Janakiram Auditorium, Chelakkara, Thrissur, Kerala',
  },
]

export const venue: Venue = {
  name: 'Akhilanjali Convention Centre',
  region: 'Cherthala, Alappuzha, Kerala',
  address: 'Akhilanjali Convention Centre, Varanad Rd, near Sastham kavala, Cherthala, Nedumprakkad, Kerala 688539',
  description:
    'Akhilanjali Convention Centre in Cherthala is a gracious venue for celebrations, nestled in the heart of Alappuzha district. With warm hospitality and elegant spaces, it provides the perfect setting for a traditional Kerala wedding.',
  details: [
    'Traditional Kerala wedding venue',
    'Spacious ceremonial hall',
    'Ample parking',
    'Accessible location in Cherthala town',
  ],
  website: 'https://akhilanjali.com/home',
  mapsQuery: 'Akhilanjali Convention Centre, Varanad Rd, near Sastham kavala, Cherthala, Nedumprakkad, Kerala 688539',
  mapsEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3144.9708!2d76.3531057!3d9.6981963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087dd3e8fc9a39%3A0xfc8bb7cb44b3614e!2sAkhilanjali%20Convention%20Centre!5e0!3m2!1sen!2sin!4v1700000000000',
  directionsQuery: 'Akhilanjali Convention Centre, Varanad Rd, near Sastham kavala, Cherthala, Nedumprakkad, Kerala 688539',
  ical: {
    title: 'Anjana & Krishnaprasad Wedding',
    start: '20260913T043000Z',
    end: '20260913T050000Z',
    location: 'Akhilanjali Convention Centre, Varanad Rd, Cherthala, Kerala 688539',
    description: 'Wedding ceremony of Anjana & Krishnaprasad',
  },
  travelStay: {
    title: 'Travel & Stay',
    items: [
      'Cherthala is well connected by road from Kochi (approx. 1.5 hrs) and Alappuzha (approx. 30 min)',
      'Nearest airport: Cochin International Airport (COK)',
      'Nearest railway station: Cherthala',
    ],
  },
}

export const liveStream: LiveStream = {
  youtubeVideoId: '',
  channelName: '',
  channelUrl: '',
  liveStartIso: '2026-09-13T10:00:00+05:30',
}

export const gallery: GalleryItem[] = [
  {
    src: '/gallery/1.avif',
    alt: 'The happy couple sharing a moment together',
    rotation: -3,
  },
  {
    src: '/gallery/2.avif',
    alt: 'The proposal at sunset',
    rotation: 2,
  },
  {
    src: '/gallery/3.avif',
    alt: 'Walking hand in hand through a sunlit path',
    rotation: -1.5,
  },
  {
    src: '/gallery/4.avif',
    alt: 'Laughing together during their engagement shoot',
    rotation: 4,
  },
  {
    src: '/gallery/5.avif',
    alt: 'Close-up of the wedding rings on a linen surface',
    rotation: -2,
  },
  {
    src: '/gallery/7.avif',
    alt: 'A beautiful moment captured together',
    rotation: 1,
  },
  {
    src: '/gallery/8.avif',
    alt: 'Sharing a laugh together',
    rotation: -3.5,
  },
  {
    src: '/gallery/9.avif',
    alt: 'Together in love',
    rotation: 2.5,
  },
  {
    src: '/gallery/10.avif',
    alt: 'A cherished memory',
    rotation: -1,
  },
]

export const rsvp: RSVP = {
  successMessage:
    'Thank you, {name}! We look forward to celebrating with you.',
  events: [
    'Wedding Ceremony \u2014 Sept 13',
    'Marriage Reception \u2014 Sept 14',
  ],
  dietaryOptions: [
    'No dietary restrictions',
    'Vegetarian',
    'Vegan',
    'Other (please specify in message)',
  ],
}
