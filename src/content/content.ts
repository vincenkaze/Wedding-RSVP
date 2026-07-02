export interface Couple {
  firstName: string
  displayName: string
}

export interface Wedding {
  date: string
  time: string
  timezone: string
  iso: string
  displayDate: string
  location: string
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

export interface StoryMilestone {
  year: string
  title: string
  body: string
  image?: string
  imageAlt?: string
}

export interface GalleryItem {
  src: string
  srcWebp?: string
  srcAvif?: string
  alt: string
  caption?: string
  aspect?: string
}

export interface RSVP {
  deadline: string
  contactNumber: string
  contactEmail: string
  web3FormsEndpoint?: string
  successMessage?: string
  events?: string[]
  dietaryOptions?: string[]
}

export interface Verse {
  text: string
  reference?: string
}

export const couple = {
  firstName: 'Olivia',
  secondName: 'James',
  displayName: 'Olivia & James',
} as const

export const wedding = {
  date: 'Saturday, October 10, 2026',
  time: '4:00 PM',
  timezone: 'Pacific Time',
  iso: '2026-10-10T16:00:00',
  displayDate: 'October 10, 2026',
  location: 'Napa Valley, California',
} as const

export const hero = {
  preTitle: 'Together with their families',
  ctaText: 'RSVP Now',
  countdownLabel: 'Countdown to our wedding',
  image: '/hero/couple.jpg',
  imageWebp: '/hero/couple.webp',
  imageAvif: '/hero/couple.avif',
  imageAlt: 'Olivia and James standing together in the golden light of a Napa Valley vineyard',
} as const

export const verse: Verse = {
  text: 'And now these three remain: faith, hope, and love. But the greatest of these is love.',
  reference: '1 Corinthians 13:13',
}

export const sections = {
  story: { label: 'Our Story', heading: 'How It Began' },
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
    parents: ['Mr. & Mrs. Alexander Bennett'],
    members: ['Emily Bennett', 'Sophia Bennett'],
  },
  groom: {
    label: 'The Groom\u2019s Family',
    parents: ['Mr. & Mrs. Rajesh Kapoor'],
    members: ['Arjun Kapoor', 'Priya Sharma'],
  },
}

export const events: WeddingEvent[] = [
  {
    title: 'Haldi Ceremony',
    date: 'Thursday, October 8, 2026',
    time: '10:00 AM',
    location: 'Villa Terrace, Domaine Carneros',
    description:
      'A joyful morning of turmeric blessings, laughter, and color shared between family and close friends.',
    mapsQuery: 'Domaine Carneros, Napa Valley, CA',
  },
  {
    title: 'Mehendi Evening',
    date: 'Friday, October 9, 2026',
    time: '5:00 PM',
    location: 'Garden Pavilion, Domaine Carneros',
    description:
      'An evening of intricate henna, live music, and celebration under the olive trees.',
    mapsQuery: 'Domaine Carneros, Napa Valley, CA',
  },
  {
    title: 'Wedding Ceremony',
    date: 'Saturday, October 10, 2026',
    time: '4:00 PM',
    location: 'Domaine Carneros, Napa Valley, CA',
    description:
      'An intimate ceremony among the vineyards as the afternoon light softens over the hills.',
    mapsQuery: 'Domaine Carneros, Napa Valley, CA',
  },
  {
    title: 'Reception & Dinner',
    date: 'Saturday, October 10, 2026',
    time: '6:00 PM',
    location: 'Domaine Carneros, Napa Valley, CA',
    description:
      'Dinner, toasts, and dancing under the stars in the estate courtyard.',
    mapsQuery: 'Domaine Carneros, Napa Valley, CA',
  },
]

export const venue: Venue = {
  name: 'Domaine Carneros',
  region: 'Napa Valley, California',
  address: '1240 Duhig Rd, Napa, CA 94559',
  description:
    'Perched among the rolling vineyards of Carneros, Domaine Carneros is a striking château inspired by the 18th-century Château de la Marquetterie in Champagne. Its sweeping terrace, candlelit ballroom, and sun-drenched courtyard make it an unforgettable setting for an intimate celebration.',
  details: [
    'Historic château estate',
    'Vineyard ceremony site',
    'Stone courtyard reception',
    'On-site accommodation',
  ],
  website: 'https://www.domainecarneros.com',
  mapsQuery: 'Domaine Carneros, 1240 Duhig Rd, Napa, CA 94559',
  mapsEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3144.123456789!2d-122.2999!3d38.2500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808412ab1234567%3A0x1234567890abcdef!2sDomaine%20Carneros!5e0!3m2!1sen!2sus!4v1234567890',
  directionsQuery: 'Domaine Carneros, 1240 Duhig Rd, Napa, CA 94559',
  ical: {
    title: 'Olivia & James Wedding',
    start: '20261010T160000',
    end: '20261010T230000',
    location: 'Domaine Carneros, 1240 Duhig Rd, Napa, CA 94559',
    description: 'Wedding celebration of Olivia & James',
  },
  travelStay: {
    title: 'Travel & Stay',
    items: [
      'Napa Valley Marriott Hotel & Spa — 15 min drive',
      'The Meritage Resort — 10 min drive',
      'Carneros Resort & Spa — on-site partner',
      'Fly into San Francisco International (SFO) or Oakland (OAK)',
    ],
  },
}

export const storyPrologue =
  'Every love story has a beginning — a single moment when two lives converge and something beautiful begins to unfold. This is ours.'

export const storyTimeline: StoryMilestone[] = [
  {
    year: '2022',
    title: 'A Chance Encounter',
    body: 'It was a rain-soaked evening in San Francisco when Olivia ducked into the same bookshop as James, both reaching for the last copy of the same novel. What began as a polite argument over who saw it first turned into three hours of conversation over coffee next door.',
    image: '/story/bookshop.jpg',
    imageAlt: 'The cozy San Francisco bookshop where Olivia and James first met',
  },
  {
    year: '2023',
    title: 'Growing Together',
    body: 'Their first date became a weekend trip to Napa, where they discovered a shared love of long walks through vineyards and slow mornings with nowhere to be. Over the next two years, they built a life that felt effortless — full of laughter, quiet Sunday rituals, and the kind of trust that only deepens with time.',
  },
  {
    year: '2025',
    title: 'The Proposal',
    body: 'On a golden afternoon among the same Napa vineyards that had become theirs, James knelt beside a weathered stone wall and asked Olivia to spend forever together. She said yes before he finished the question.',
    image: '/story/proposal.jpg',
    imageAlt: 'James proposing to Olivia at sunset in a Napa Valley vineyard',
  },
]

export const gallery: GalleryItem[] = [
  {
    src: '/gallery/first-moment.jpg',
    srcWebp: '/gallery/first-moment.webp',
    srcAvif: '/gallery/first-moment.avif',
    alt: 'Olivia and James sharing their first moment as a couple',
    caption: 'The beginning',
    aspect: 'aspect-[3/4]',
  },
  {
    src: '/gallery/proposal.jpg',
    srcWebp: '/gallery/proposal.webp',
    srcAvif: '/gallery/proposal.avif',
    alt: 'The proposal at sunset in Napa Valley',
    caption: 'She said yes',
    aspect: 'aspect-square',
  },
  {
    src: '/gallery/vineyard-walk.jpg',
    srcWebp: '/gallery/vineyard-walk.webp',
    srcAvif: '/gallery/vineyard-walk.avif',
    alt: 'Walking hand in hand through the vineyards',
    caption: 'Sunday afternoons',
    aspect: 'aspect-[4/5]',
  },
  {
    src: '/gallery/engagement.jpg',
    srcWebp: '/gallery/engagement.webp',
    srcAvif: '/gallery/engagement.avif',
    alt: 'Laughing together during their engagement shoot',
    caption: 'Pure joy',
    aspect: 'aspect-[3/4]',
  },
  {
    src: '/gallery/detail-rings.jpg',
    srcWebp: '/gallery/detail-rings.webp',
    srcAvif: '/gallery/detail-rings.avif',
    alt: 'Close-up of the wedding rings on a linen surface',
    caption: '',
    aspect: 'aspect-square',
  },
  {
    src: '/gallery/toast.jpg',
    srcWebp: '/gallery/toast.webp',
    srcAvif: '/gallery/toast.avif',
    alt: 'Friends raising a glass to the happy couple',
    caption: 'Our people',
    aspect: 'aspect-[4/5]',
  },
]

export const rsvp: RSVP = {
  deadline: 'September 10, 2026',
  contactNumber: '15551234567',
  contactEmail: 'rsvp@oliviaandjames.com',
  web3FormsEndpoint: undefined,
  successMessage:
    'Thank you, {name}! Your response has been received. We cannot wait to celebrate with you.',
  events: [
    'Haldi Ceremony — Oct 8',
    'Mehendi Evening — Oct 9',
    'Wedding Ceremony — Oct 10',
    'Reception & Dinner — Oct 10',
  ],
  dietaryOptions: [
    'No dietary restrictions',
    'Vegetarian',
    'Vegan',
    'Gluten-free',
    'Halal',
    'Kosher',
    'Allergies (please specify in message)',
  ],
}
