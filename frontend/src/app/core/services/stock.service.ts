import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Article {
  id: number;
  nom: string;
  type?: string;
  unite?: string;
}

export interface Stock {
  id: number;
  article: Article;
  quantite: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/stock`);
  }

  updateStock(id: number, quantite: string, type: string, commentaire?: string): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiUrl}/stock/${id}`, {
      quantite,
      type,
      commentaire
    });
  }

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/articles`);
  }

  createArticle(article: Partial<Article>): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/articles`, article);
  }

  updateArticle(id: number, article: Partial<Article>): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/articles/${id}`, article);
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/articles/${id}`);
  }
}
