
# AdvisorSystem

This project was generated using Angular CLI version 21.2.2.


## 1.ดาวโหลด หรือ อัพเดท Docker Desktop , Node.js , Git
## 2.หลังจาก clone โค้ดมาแล้วให้รัน
```bash
  npm install
```
## 2.เปิด Docker Desktop แล้วรัน
```bash
  npx supabase start
```
 พอมันรันเสร็จ มันจะพ่นตาราง URL และ Keys ออกมาในเครื่อง (ซึ่ง Keys จะไม่เหมือนกับเครื่องของแต่ละคน แต่ไม่เป็นไร ให้จดเป็นของตัวเอง) 

## 3. เติมกุญแจ 

นี่คือจุดที่สำคัญที่สุด! ต้องเปิดไฟล์ `src/environments/environment.ts` แล้วทำแบบนี้:

- ไปก๊อป **`Project URL`** จากหน้าจอดำ มาแปะใน `supabaseUrl`
- ไปก๊อป **`pub key`** จากหน้าจอดำ มาแปะใน `supabaseKey`


 **ตัวอย่าง**
    
    `export const environment = {
      supabaseUrl: 'http://127.0.0.1:54321', 
      supabaseKey: 'eyJhbGciOiJIUzI1NiI...', 
    };`


## 4. "รันแอป" (Start the App)
```bash
ng serve
```
หรือ 
```bash
npm start
```

## 5. ห้ามเอา ไฟล์ environment..ts   เข้า github หรือ push เด็ดขาด

## หลังจากสร้างโปรเจค

## ดูด database
```bash
npx supabase db diff --local -f update_tables
```
## ดูดข้อมูลใน local

```bash
npx supabase db dump --local --data-only --use-copy=false -f supabase/seed.sql
```

## reset database
```bash
npx supabase db reset
```

## ลง could
```bash
npx supabase login
```

```bash
npx supabase db push
```


## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
