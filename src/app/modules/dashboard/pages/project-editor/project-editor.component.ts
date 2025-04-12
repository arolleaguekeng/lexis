import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { ProjectModel } from '../../models/project.model';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { FirstPhaseMainService } from '../../services/ai-agents/Phase-1-Planning/first-phase-main.service';
import { AnalysisResultModel } from '../../models/analysisResult.model';
import { LoaderComponent } from '../../../../components/loader/loader.component';
import { MarkdownComponent } from 'ngx-markdown';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../../auth/services/auth.service';
import { first } from 'rxjs';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { ThirdPhaseMainService } from '../../services/ai-agents/Phase-3-Design/third-phase-main.service';
import { DiagramModel } from '../../models/diagram.model';

@Component({
  selector: 'app-project-editor',
  imports: [
    TabsModule,
    FormsModule,
    LoaderComponent,
    MarkdownComponent,
    AccordionModule,
    AvatarModule,
    BadgeModule,
  ],
  templateUrl: './project-editor.component.html',
  styleUrl: './project-editor.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectEditorComponent implements OnInit {
  id = '';
  project!: ProjectModel;
  route = inject(ActivatedRoute);
  firstPhaseService = inject(FirstPhaseMainService);
  thirdPhaseService = inject(ThirdPhaseMainService);
  isLoaded = signal(true);
  currentUser?: User | null;
  auth = inject(AuthService);
  user$ = this.auth.user$;
  projectService = inject(ProjectService);
  async ngOnInit() {
    try {
      const user = await this.auth.user$.pipe(first()).toPromise();
      this.currentUser = user;

      if (!this.currentUser) {
        console.log('Utilisateur non connecté');
        return;
      }

      this.id = this.route.snapshot.paramMap.get('id')!;
      if (!this.id) {
        console.log('ID du projet introuvable');
        return;
      }

      const project = await this.projectService.getUserProjectById(this.id);
      if (!project) {
        console.log('Projet non trouvé');
        return;
      }

      this.project = project;
      for (let phase in this.project.selectedPhases) {
        console.log('Phase:', phase);
        switch (phase) {
          case 'planning': {
            console.log('Planing selected');
            if (!this.project.analysisResultModel?.planning) {
              console.log('Exécution de la première phase...');
              const analysis = await this.firstPhaseService.executeFirstPhase(
                this.project
              );
              this.project.analysisResultModel =
                analysis as AnalysisResultModel;

              await this.projectService.editUserProject(this.id, this.project);
            } else {
              console.log('Analyse déjà existante.');
            }
            break;
          }
          case 'charter': {
            break;
          }
          case 'design': {
            if (
              this.project.analysisResultModel.design &&
              this.project.analysisResultModel.design.length <= 0
            ) {
              console.log('Tray to generate diagrams...');
              const diagrams =
                await this.thirdPhaseService.executeThirdPhaseDiagrams(
                  this.project
                );
              this.project.analysisResultModel.design =
                diagrams as DiagramModel[];

              await this.projectService.editUserProject(this.id, this.project);
            }
            break;
          }
          case 'development': {
            break;
          }

          case 'landing': {
            break;
          }
          case 'testing': {
            break;
          }
          default: {
          }
        }
      }

      this.isLoaded.set(false);
    } catch (error) {
      console.error(
        'Erreur lors du chargement du projet ou de l’utilisateur',
        error
      );
    }
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 400);
    textarea.style.height = newHeight + 'px';
  }
}
// this.isLoaded = true;
