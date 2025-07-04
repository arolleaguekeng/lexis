import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { User } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { initEmptyObject } from '../../../../utils/init-empty-object';
import { AuthService } from '../../../auth/services/auth.service';
import { AnalysisResultModel } from '../../models/analysisResult.model';
import { ProjectModel } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { Loader } from '../../../../components/loader/loader';
import { WebContainerModel } from '../../models/webcontainer.model';
import { CookieService } from '../../../../shared/services/cookie.service';

@Component({
  selector: 'app-show-development',
  imports: [Loader],
  templateUrl: './show-development.html',
  styleUrl: './show-development.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowDevelopmentComponent {
  auth = inject(AuthService);
  user$ = this.auth.user$;
  projectService = inject(ProjectService);
  project: ProjectModel = initEmptyObject<ProjectModel>();

  id = '';
  analis: AnalysisResultModel = initEmptyObject<AnalysisResultModel>();
  route = inject(ActivatedRoute);
  isLoaded = signal(true);
  currentUser?: User | null;
  webgenUrl = environment.services.webgen.url;
  cookieService = inject(CookieService);

  redirectToReactApp(projectId: string) {
    // URL de votre application React
    const reactAppUrl = `${this.webgenUrl}/generate/${projectId}`;

    // Option 1: Redirection simple
    window.location.href = reactAppUrl;

    // Option 2: Redirection avec état (si les apps partagent un domaine parent)
    // this.router.navigateByUrl('/external-redirect', { state: { url: reactAppUrl } });
  }

  // Dans votre composant
  stacks = [
    {
      id: 'react',
      name: 'React',
      icon: 'R',
      color: '#61DAFB',
      description: 'Modern React 18 + Vite template',
      badges: ['HMR', 'SEO Ready'],
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      icon: 'N',
      color: '#000000',
      description: 'Full-stack framework with RSC',
      badges: ['App Router', 'ISR'],
    },
    {
      id: 'angular',
      name: 'Angular',
      icon: 'A',
      color: '#DD0031',
      description: 'Enterprise-grade framework',
      badges: ['SSR', 'Standalone'],
    },
    {
      id: 'vue',
      name: 'Vue',
      icon: 'V',
      color: '#42b883',
      description: 'Progressive framework',
      badges: ['Composition API', 'Pinia'],
    },
    {
      id: 'astro',
      name: 'Astro',
      icon: 'A',
      color: '#FF5D01',
      description: 'Island architecture',
      badges: ['MPA', '0JS'],
    },
    {
      id: 'html',
      name: 'HTML/CSS',
      icon: 'H',
      color: '#E44D26',
      description: 'Vanilla with Tailwind',
      badges: ['Lightweight'],
    },
  ];

  selectedStackId: string | null = null;

  selectStack(id: string) {
    this.selectedStackId = this.selectedStackId === id ? null : id;
  }

  // Dans votre composant
  pageOptions = [
    {
      id: 'seo',
      name: 'SEO Optimization',
      icon: '🔍',
      description: 'Pre-configured meta tags and sitemap',
      features: ['Meta Tags', 'JSON-LD', 'Sitemap'],
      enabled: true,
    },
    {
      id: 'contact',
      name: 'Contact Form',
      icon: '✉️',
      description: 'Embedded form with submission handling',
      features: ['Netlify', 'Recaptcha', 'Email Notifications'],
      enabled: false,
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📊',
      description: 'Integrated tracking and metrics',
      features: ['Google Analytics', 'Hotjar', 'Fathom'],
      enabled: true,
    },
    {
      id: 'i18n',
      name: 'Multilingual',
      icon: '🌐',
      description: 'Multi-language support',
      features: ['i18n', 'Language Switcher'],
      enabled: false,
    },
    {
      id: 'performance',
      name: 'Performance',
      icon: '⚡',
      description: 'Optimized loading strategy',
      features: ['Lazy Loading', 'Image Optimization', 'Critical CSS'],
      enabled: true,
    },
  ];
  hoveredOption: string | null = null;

  toggleOption(id: string) {
    const option = this.pageOptions.find((o) => o.id === id);
    if (option) {
      option.enabled = !option.enabled;
    }
  }

  async onGenerateApplication() {
    this.isLoaded.set(true);

    if (this.project.analysisResultModel.development) {
      this.isLoaded.set(false);
      return;
    }

    // Create new application model
    const applicationModel = {
      selectedOptions: {
        stack: this.selectedStackId || '',
        seoEnabled:
          this.pageOptions.find((o) => o.id === 'seo')?.enabled || false,
        contactFormEnabled:
          this.pageOptions.find((o) => o.id === 'contact')?.enabled || false,
        analyticsEnabled:
          this.pageOptions.find((o) => o.id === 'analytics')?.enabled || false,
        i18nEnabled:
          this.pageOptions.find((o) => o.id === 'i18n')?.enabled || false,
        performanceOptimized:
          this.pageOptions.find((o) => o.id === 'performance')?.enabled ||
          false,
      },
    };

    // Update project with new application model
    // this.project.analysisResultModel.development.selectedOptions =
    //   applicationModel.selectedOptions;
    await this.projectService.updateProject(this.id, this.project);
    this.isLoaded.set(false);
    this.redirectToReactApp(this.id);
  }

  async ngOnInit() {
    try {
      this.isLoaded.set(true);
      const user = await this.auth.user$.pipe(first()).toPromise();
      this.currentUser = user;

      if (!this.currentUser) {
        console.log('Utilisateur non connecté');
        return;
      }

      this.id = this.cookieService.get('projectId')!;
      if (!this.id) {
        console.log('ID du projet introuvable');
        return;
      }

      this.projectService.getProjectById(this.id).subscribe({
        next: (project) => {
          if (!project) {
            console.log('Projet non trouvé');
            this.isLoaded.set(false);
            return;
          }

          if (!project.analysisResultModel) {
            project.analysisResultModel = this.analis as AnalysisResultModel;
          }
          this.project = project;
          this.isLoaded.set(false);
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du projet:', err);
          this.isLoaded.set(false);
        },
      });
    } catch (error) {
      console.error(
        'Erreur lors du chargement du projet ou de l’utilisateur',
        error
      );
    }
  }
}
