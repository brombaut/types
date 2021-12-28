import { FirestoreBook } from './FirestoreBook';
import { Shelf } from './Shelf';
import { FirestoreDateTranslator, ILocalType } from 'firebase-firestore-facade';

export class Book implements ILocalType {
  id: string;
  goodreads_review_id: string;
  isbn13: string;
  title: string;
  shortTitle: string;
  authors: Array<string>;
  numPages: number;
  link: string;
  shelf: Shelf;
  onPage: number | null;
  dateStarted: Date | null;
  dateFinished: Date | null;
  rating: number | null;
  toReadOrder: number | null

  constructor(dto: FirestoreBook) {
    if (!dto.id) {
      throw new Error('DTO does not have an ID');
    }
    this.id = dto.id;
    this.goodreads_review_id = dto.goodreads_review_id;
    this.isbn13 = dto.isbn13;
    this.title = dto.title;
    this.shortTitle = dto.shortTitle;
    this.authors = dto.authors;
    this.numPages = dto.numPages;
    this.link = dto.link;
    this.shelf = dto.shelf;
    this.onPage = dto.onPage;
    this.toReadOrder = dto.toReadOrder;
    if (dto.dateStarted) {
      this.dateStarted = new FirestoreDateTranslator().fromFirestoreDate(dto.dateStarted).toDate();
    } else {
      this.dateStarted = null;
    }
    if (dto.dateFinished) {
      this.dateFinished = new FirestoreDateTranslator().fromFirestoreDate(dto.dateFinished).toDate();
    } else {
      this.dateFinished = null;
    }
    this.rating = dto.rating;
  }

  toFirestoreType(): FirestoreBook {
    let sDate = null;
    if (this.dateStarted) {
      sDate = new FirestoreDateTranslator().fromDate(this.dateStarted).toFirestoreDate();
    }
    let fDate = null;
    if (this.dateFinished) {
      fDate = new FirestoreDateTranslator().fromDate(this.dateFinished).toFirestoreDate();
    }
    return {
      id: this.id,
      goodreads_review_id: this.goodreads_review_id,
      isbn13: this.isbn13,
      title: this.title,
      shortTitle: this.shortTitle,
      authors: this.authors,
      numPages: this.numPages,
      link: this.link,
      shelf: this.shelf,
      onPage: this.onPage,
      dateStarted: sDate,
      dateFinished: fDate,
      rating: this.rating,
      toReadOrder: this.toReadOrder,
    };
  }

  get authorsString(): string {
    return this.authors.join(', ');
  }

  get yearStarted(): number {
    if (!this.dateStarted) {
      return -1;
    }
    return this.dateStarted.getFullYear();
  }
  get dateStartedFormatted(): string {
    if (!this.dateStarted) {
      return '';
    }
    return `${this.dateStarted.getDate()}/${this.dateStarted.getMonth()+1}/${this.dateStarted.getFullYear()}`
  }

  get yearFinished(): number {
    if (!this.dateFinished) {
      return -1;
    }
    return this.dateFinished.getFullYear();
  }
  get dateFinishedFormatted(): string {
    if (!this.dateFinished) {
      return '';
    }
    return `${this.dateFinished.getDate()}/${this.dateFinished.getMonth()+1}/${this.dateFinished.getFullYear()}`
  }

  startReading(): void {
    if (this.shelf !== Shelf.TOREAD) {
      throw new Error('Book has already been read');
    }
    this.shelf = Shelf.CURRENTLYREADING;
    this.dateStarted = new FirestoreDateTranslator().now().toDate();
    this.onPage = 0;
    this.toReadOrder = null;
  }

  finishedReading(): void {
    if (this.shelf !== Shelf.CURRENTLYREADING) {
      throw new Error('Book is not currently being read');
    }
    this.shelf = Shelf.READ;
    this.dateFinished = new FirestoreDateTranslator().now().toDate();
    this.onPage = this.numPages;
    this.toReadOrder = null;
  }

  compareToDateFinished(b: Book): number {
    if (!this.dateFinished) {
      return -1;
    }
    if (!b.dateFinished) {
      return 1;
    }
    return b.dateFinished.getTime() - this.dateFinished.getTime();
  }

  compareToDateStarted(b: Book): number {
    if (!this.dateStarted) {
      return -1;
    }
    if (!b.dateStarted) {
      return 1;
    }
    return b.dateStarted.getTime() - this.dateStarted.getTime();
  }

  static attributes(): string[] {
    return [
      'id',
      'goodreads_review_id',
      'isbn13',
      'title',
      'shortTitle',
      'authors',
      'numPages',
      'link',
      'shelf',
      'onPage',
      'dateStarted',
      'dateFinished',
      'rating',
      'toReadOrder',
    ];
  }

}
