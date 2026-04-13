import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-register-success',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterModule, TranslateModule],
  templateUrl: './register-success.component.html',
  styleUrls: ['./register-success.component.scss'],
})
export class RegisterSuccessComponent {
  private readonly route = inject(ActivatedRoute);

  readonly email$: Observable<string> = this.route.queryParamMap.pipe(
    map((params: ParamMap) => params.get('email') ?? ''),
  );
}
