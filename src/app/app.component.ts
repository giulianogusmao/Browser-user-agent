import { IAcessos } from './acessos.interface';
import { Component, OnInit } from '@angular/core';
import { AcessosService } from './acessos.service';
import { NgModel } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [AcessosService],
})
export class AppComponent implements OnInit {
  title = 'app';

  qtdBusca = 2;
  qtdExibir = 100;
  buscaNRepetidos = true;
  filteredAcessos: IAcessos[] = [];
  listaResults: Array<any>;
  grouplistaResults: Array<any>;
  private _listaAcessos: IAcessos[] = [];
  private _listWaitObservables = [];

  constructor(
    private _acessosService: AcessosService,
  ) { }

  ngOnInit() {
    this._acessosService.getAll().subscribe(
      acessos => {
        this._listaAcessos = acessos;
        this.filtraAcessos();
      }
    );

    this.refreshResult();
  }

  filtraAcessos() {
    if (this.buscaNRepetidos) {
      const listAtual = this._getResult();
      this.filteredAcessos = this._listaAcessos.filter(acesso =>
        !listAtual.some(item => acesso.user_agent === item['user_agent']));
    } else {
      this.filteredAcessos = this._listaAcessos;
    }
  }

  buscar() {
    const itensBusca = this.filteredAcessos.slice(0, this.qtdBusca);

    itensBusca.forEach(item => {

      const observable = this._acessosService.getBrowser(item);
      this._listWaitObservables.push(observable);
      observable.subscribe(
        (res: Array<any>) => {
          try {
            if (res['result']['code'] === 'success') {
              res['parse']['qtd_acessos'] = item.qtd_acessos;
              this._addResult(res['parse']);
            } else {
              throw new Error(res['result']['message']);
            }
          } catch (err) {
            console.error(`Erro ao consultar o user agent: ${item.user_agent} com ${item.qtd_acessos} de acessos.`);
            console.error(err);
          }
        }
      );
    });

    // quando terminar todas requisições atualiza a lista com os resultados
    Observable.forkJoin(...this._listWaitObservables).subscribe((response) => {
      setTimeout(() => {
        this.refreshResult();
        this.filtraAcessos();
      }, 100);
    });
  }


  private _saveResult(arr: Array<any>): void {
    localStorage.setItem('userAgentList', JSON.stringify(arr));
  }

  private _addResult(novoItem: any): void {
    try {
      let exists = false;
      const itens = this._getResult();

      // verifica se o item já existe e atualiza
      itens.forEach(item => {
        if (item['user_agent'] === novoItem['user_agent']) {
          exists = true;
          item = novoItem;
        }
      });

      // caso não exista adiciona no array
      if (!exists) {
        itens.push(novoItem);
      }

      this._saveResult(itens);
    } catch (err) {
      console.error(`Erro ao adicionar user-agent ${novoItem['user_agent']} na lista de reusltados`);
      console.error(err);
    }
  }

  private _getResult(): Array<any> {
    return JSON.parse(localStorage.getItem('userAgentList')) || [];
  }

  refreshResult(): void {
    this.listaResults = this._getResult();
    this.grouplistaResults = [];
    // this.grouplistaResults = this.listaResults;

    Observable.from(this.listaResults)
      .groupBy(x => x.software)
      .flatMap(group => {
        return group.reduce((acc, currentValue) => {
          acc.qtd_acessos += currentValue.qtd_acessos;
          return acc;
        });
      })
      .subscribe(sum => this.grouplistaResults.push(sum));
  }

  clearResult(): void {
    this._saveResult([]);
  }
}
