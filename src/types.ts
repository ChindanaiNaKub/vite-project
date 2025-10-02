export interface Event {
  id: number
  category: string
  title: string
  description: string
  location: string
  date: string
  time: string
  petAllowed: boolean
  organizer: Organizer
  images: string[]
}

export interface Organizer {
  id: number
  name: string
  roles: string[]
}

export interface Student {
  id: number
  studentId: string
  name: string
  surname: string
  gpa: number
  image: string
  description: string
}

export interface MessagaState {
  message: string
}

export interface EventState {
  event: Event | null
}

export interface Organization {
  id: number
  name: string
  description: string
  address: string
  contactPerson: string
  email: string
  phone: string
  website?: string
  images?: string[]
  image?: string  // For backwards compatibility with db.json
  establishedDate: string
}
