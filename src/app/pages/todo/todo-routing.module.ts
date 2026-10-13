import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TodoComponent } from './todo.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoFormComponent } from './todo-form/todo-form.component';



const routes: Routes = [{
  path: '',
  component: TodoComponent,
  children: [{
    path: 'list-todo',
    component: TodoListComponent,
  }, {
    path: 'crud-todo',
    component: TodoFormComponent,
  }],
}];

@NgModule({
  imports: [
      RouterModule.forChild(routes),
  ],
  exports: [
      RouterModule,
  ],
})

export class TodoRoutingModule { }

export const routedComponents = [
  TodoComponent,
  TodoListComponent,
  TodoFormComponent,
];
