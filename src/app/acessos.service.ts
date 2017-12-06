import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IAcessos } from './acessos.interface';

@Injectable()
export class AcessosService {

  private _user_key = '209d2369f8828c51c554de473ba71f9c';
  private _url = 'https://api.whatismybrowser.com/api/v2/user_agent_parse';
  private _headerAPI: HttpHeaders;

  constructor(
    private _http: HttpClient,
  ) {
    this._headerAPI = new HttpHeaders().set('X-API-KEY', this._user_key);
  }

  getAll() {
    return this._http.get<IAcessos[]>('assets/dados/acessos.json');
  }

  getBrowser(acesso: IAcessos) {
    return this._http.post(this._url, this._prepareJson(acesso), { headers: this._headerAPI });
  }

  private _prepareJson(acesso: IAcessos) {
    return JSON.stringify({
      user_agent: acesso.user_agent,
    });
  }

}
