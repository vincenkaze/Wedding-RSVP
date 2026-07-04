Wedding Details



Single source of truth for events, times, and places. Update here, then the site will follow once  is updated to match.



Couple





Bride: Anjana Sivanandan (Anju)



Groom: Krishnaprasad Thulasidas (Krishna)



Display name: Anjana & Krishnaprasad



Full name: Anjana Sivanandan & Krishnaprasad Thulasidas



Bride's Family (Details.jpeg)





Father: Mr. Sivannandan K.K



Mother: Mrs. Usha Sivanandan



Address: Kaniyamparambil House, Pallippuram P.O, Cherthala, Alappuzha



Phone: +91 96567 4840



Contact for bride's side of events



Groom's Family (Details2.jpeg)





Father: Late Mr. Thulasidas



Mother: Mrs. Ushakumari



Address: Villadath House, Chelakkara (PO), Kolathur, Thrissur 680586



Phone: +91 90487 38625



Contact for groom's side of events



Events

Event 1 — Thalikettu (Wedding Ceremony)





Date: Sunday, September 13, 2026



Malayalam date: 1202 Chingam 28



Muhurtham (ceremony time): 10:00 AM – 10:30 AM



Venue: Akhilanjali Convention Centre, Cherthala



Region: Cherthala, Alappuzha, Kerala



Address: Akhilanjali Convention Centre, Varanad Rd, near Sastham kavala, Cherthala, Nedumprakkad, Kerala 688539



Description: A sacred Muhurtham ceremony uniting Anjana and Krishnaprasad in the presence of family and loved ones.



Maps query: Akhilanjali Convention Centre, Varanad Rd, near Sastham kavala, Cherthala, Nedumprakkad, Kerala 688539

Event 2 — Marriage Reception





Date: Monday, September 14, 2026



Malayalam date: 1202 Chingam 29



Time: 4:00 PM – 8:00 PM



Venue: Janakiram Auditorium, Chelakkara



Region: Chelakkara, Thrissur, Kerala



Hosted by: Krishnapriya, Praveen, Avanthika & Advay Krishna (groom's siblings/family)



Maps query: Janakiram Auditorium, Chelakkara, Thrissur, Kerala



Master Timings (for countdown and calendar)





Wedding ISO: 2026-09-13T10:00:00+05:30



Reception ISO: 2026-09-14T16:00:00+05:30



Timezone: IST (UTC+5:30)



Sharing Happiness

Listed on groom's invitation:





Krishnapriya



Praveen



Avanthika



Advay Krishna



What still needs updating in 

To reflect this Details.md, the following  changes are needed:





Wedding date stays Sept 13, 2026 — already correct



Add second event (Marriage Reception) to events array:

{
  title: 'Marriage Reception',
  date: 'Monday, September 14, 2026',
  time: '4:00 PM – 8:00 PM',
  location: 'Janakiram Auditorium, Chelakkara, Thrissur, Kerala',
  description: 'A celebration with the groom\'s family in Chelakkara. Hosted by Krishnapriya, Praveen, Avanthika and Advay Krishna.',
  mapsQuery: 'Janakiram Auditorium, Chelakkara, Thrissur, Kerala',
}



Groom family members field should include siblings:

groom: {
  label: 'The Groom\'s Family',
  parents: ['Late Mr. Thulasidas', 'Mrs. Ushakumari'],
  members: ['Krishnapriya', 'Praveen', 'Avanthika', 'Advay Krishna'],
}



Bride family members is currently empty — leave empty unless told otherwise (Vaishnav was on the printed card as "Sharing Happiness" line, not a sibling listing)



Notes for the developer (me)





The site currently shows ONLY the Sept 13 wedding. Adding the Sept 14 reception to the Events section is a small, isolated change (~10 lines in ).



No layout, component, or visual changes needed — just data.



After updating , verify the Events section renders both events correctly on mobile (360px), tablet (768px), and desktop (1440px).



The Reception is in a different city (Chelakkara, Thrissur vs. Cherthala, Alappuzha) — the existing single-venue setup won't auto-handle this. Either: (a) make venue an array, or (b) leave primary venue as wedding venue and put reception location only in the event entry. (b) is simpler and matches current code.
