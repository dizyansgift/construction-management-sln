import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { beforeEach, describe, expect, it } from 'vitest';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the project overview', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Project overview');
  });

  it('should expose the construction workflow phases and project detail view', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.constructionPhases().some((phase) => phase.id === 'A' && phase.name === 'Foundation / Substructure')).toBe(true);
  });
});
