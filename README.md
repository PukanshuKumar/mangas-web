# MangasWeb

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


src/
├── app/
│   ├── core/                      # Core services, guards, and interceptors
│   │   ├── services/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── shared/                    # Shared components, pipes, and modules
│   │   ├── components/
│   │   │   ├── header/
│   │   │   │   ├── header.component.ts
│   │   │   │   ├── header.component.html
│   │   │   │   └── header.component.scss
│   │   │   └── footer/
│   │   │       ├── footer.component.ts
│   │   │       ├── footer.component.html
│   │   │       └── footer.component.scss
│   │   ├── pipes/
│   │   └── shared.module.ts
│   ├── pages/                     # Feature-specific pages
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.scss
│   │   │   └── register/
│   │   │       ├── register.component.ts
│   │   │       ├── register.component.html
│   │   │       └── register.component.scss
│   │   ├── bookmark/
│   │   │   ├── bookmark.component.ts
│   │   │   ├── bookmark.component.html
│   │   │   └── bookmark.component.scss
│   │   ├── chapter/
│   │   │   ├── chapter.component.ts
│   │   │   ├── chapter.component.html
│   │   │   └── chapter.component.scss
│   │   ├── detail-view/
│   │   │   ├── detail-view.component.ts
│   │   │   ├── detail-view.component.html
│   │   │   └── detail-view.component.scss
│   │   ├── latest-manga/
│   │   │   ├── latest-manga.component.ts
│   │   │   ├── latest-manga.component.html
│   │   │   └── latest-manga.component.scss
│   │   ├── list-view/
│   │   │   ├── list-view.component.ts
│   │   │   ├── list-view.component.html
│   │   │   └── list-view.component.scss
│   │   ├── new-manga/
│   │   │   ├── new-manga.component.ts
│   │   │   ├── new-manga.component.html
│   │   │   └── new-manga.component.scss
│   │   ├── top-manga/
│   │   │   ├── top-manga.component.ts
│   │   │   ├── top-manga.component.html
│   │   │   └── top-manga.component.scss
│   │   └── home/                  # For index.html / home page
│   │       ├── home.component.ts
│   │       ├── home.component.html
│   │       └── home.component.scss
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   ├── app.component.html
│   └── app.module.ts
├── assets/
├── environments/
└── index.html
