import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RenderFlashDirective } from '../../directives/render-flash.directive';
import { RenderLogService } from '../../services/render-log.service';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, RenderFlashDirective],
  template: `
    <div class="component-card-body dom-node"
         appRenderFlash="FormComponent · wrapper">
      <form [formGroup]="form">
        <div class="form-row">
          <label class="form-label">Prénom</label>
          <input class="form-input dom-node"
                 formControlName="firstname"
                 placeholder="ex: Marie"
                 appRenderFlash="FormComponent · input[firstname]">
        </div>
        <div class="form-row">
          <label class="form-label">Email</label>
          <input class="form-input dom-node"
                 formControlName="email"
                 placeholder="ex: marie@example.com"
                 appRenderFlash="FormComponent · input[email]">
        </div>
        <div class="form-preview dom-node"
             appRenderFlash="FormComponent · FormGroup preview">
          <div class="form-preview-label">// Valeur du FormGroup</div>
          <div style="color:var(--text-dim)">{{ formValue() }}</div>
        </div>
      </form>
      <div class="timer-hint">
        <code>valueChanges</code> (Observable) → <code>formValue.set()</code> → signal → Angular déclenche CD sans Zone.js ni <code>markForCheck()</code>.
      </div>
    </div>
  `,
})
export class Form implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private log = inject(RenderLogService);
  private sub!: Subscription;

  form = this.fb.group({ firstname: '', email: '' });
  formValue = signal('{ firstname: "", email: "" }');

  ngOnInit(): void {
    this.sub = this.form.valueChanges.subscribe(val => {
      this.formValue.set(`{ firstname: "${val.firstname ?? ''}", email: "${val.email ?? ''}" }`);
      this.log.addEntry({
        component: 'FormComponent',
        action: 'valueChanges',
        type: 'input',
        detail: `firstname="${val.firstname}", email="${val.email}"`,
      });
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
