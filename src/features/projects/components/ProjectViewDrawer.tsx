'use client';

import { memo } from 'react';
import { Project, ProjectActivity, ProjectPriority, ProjectStage, ProjectStatus } from '@/features/projects/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectTimeline } from './ProjectTimeline';
import { ProjectCustomFields } from './ProjectCustomFields';
import { useProjectConfiguration } from '@/features/projects/hooks/useProjects';
import { getProjectStatusVariant, getPriorityVariant, getHealthStatusVariant } from '@/features/projects/constants';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/core/routes';
import {
  EntityViewDrawer,
  EntityViewHeader,
  EntityViewBadges,
  EntityViewKpiStrip,
  EntityViewBody,
  EntityViewSection,
  EntityViewFieldGrid,
  EntityViewField,
  EntityViewTabs,
  EntityViewTabsList,
  EntityViewTabTrigger,
  EntityViewTabContent,
  EntityViewFooter,
  formatDrawerDate,
  formatDrawerBool,
} from '@/components/drawer/EntityViewDrawer';
import { ExternalLink, FileText, TrendingUp, DollarSign, Wallet, Activity } from 'lucide-react';

interface ProjectViewDrawerProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (project: Project) => void;
  activities?: ProjectActivity[];
}

function formatCurrency(value?: number) {
  if (value === undefined || value === null) return '-';
  return `₹${value.toLocaleString('en-IN')}`;
}

export const ProjectViewDrawer = memo(function ProjectViewDrawer({
  project,
  open,
  onOpenChange,
  onEdit,
  activities = [],
}: ProjectViewDrawerProps) {
  const router = useRouter();
  const projectConfig = useProjectConfiguration();

  if (!project) return null;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={project.projectName}
        subtitle={`${project.projectCode} · ${project.customerName}`}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={getProjectStatusVariant(project.status as ProjectStatus)}>{project.status}</Badge>
          <Badge variant="outline">{project.stage as ProjectStage}</Badge>
          <Badge variant={getPriorityVariant(project.priority as ProjectPriority)}>{project.priority}</Badge>
          <Badge variant={getHealthStatusVariant(project.healthStatus)}>{project.healthStatus}</Badge>
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            {
              label: 'Progress',
              value: `${project.progress}%`,
              icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
              accentClassName: 'text-blue-600',
            },
            {
              label: 'Revenue',
              value: formatCurrency(project.value),
              icon: <DollarSign className="h-4 w-4 text-green-600" />,
              accentClassName: 'text-green-600',
            },
            {
              label: 'Budget',
              value: formatCurrency(project.budget),
              icon: <Wallet className="h-4 w-4 text-purple-600" />,
              accentClassName: 'text-purple-600',
            },
            {
              label: 'Health',
              value: project.healthStatus,
              icon: <Activity className="h-4 w-4 text-amber-600" />,
              accentClassName: 'text-amber-600',
            },
          ]}
        />

        <EntityViewTabs defaultValue="overview">
          <EntityViewTabsList>
            <EntityViewTabTrigger value="overview">Overview</EntityViewTabTrigger>
            <EntityViewTabTrigger value="specs">Specifications</EntityViewTabTrigger>
            <EntityViewTabTrigger value="progress">Progress</EntityViewTabTrigger>
            <EntityViewTabTrigger value="references">References</EntityViewTabTrigger>
            <EntityViewTabTrigger value="activity">Activity</EntityViewTabTrigger>
          </EntityViewTabsList>

          <EntityViewTabContent value="overview">
            <EntityViewSection title="Project Details">
              <EntityViewFieldGrid>
                <EntityViewField label="Project Code" value={project.projectCode} />
                <EntityViewField label="Project Type" value={project.projectType} />
                <EntityViewField label="Customer" value={project.customerName} />
                <EntityViewField label="Project Manager" value={project.projectManager} />
                <EntityViewField label="Location" value={project.location} />
                <EntityViewField label="City / State" value={`${project.city}, ${project.state}`} />
                <EntityViewField label="Start Date" value={formatDrawerDate(project.startDate)} />
                <EntityViewField label="End Date" value={formatDrawerDate(project.endDate)} />
              </EntityViewFieldGrid>
            </EntityViewSection>

            <EntityViewSection title="Custom Fields">
              <ProjectCustomFields mode="view" fields={projectConfig.customFields} values={project.customFields} />
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="specs">
            <EntityViewSection title="PEB Specifications">
              <EntityViewFieldGrid>
                <EntityViewField label="Structure Type" value={project.structureType} />
                <EntityViewField label="Roof Type" value={project.roofType} />
                <EntityViewField label="Wall Type" value={project.wallType} />
                <EntityViewField label="Crane System" value={project.craneSystem} />
                <EntityViewField label="Width (m)" value={project.width} />
                <EntityViewField label="Length (m)" value={project.length} />
                <EntityViewField label="Height (m)" value={project.height} />
                <EntityViewField label="Bay Spacing (m)" value={project.baySpacing} />
                <EntityViewField label="Covered Area (sq.m)" value={project.coveredArea} />
                <EntityViewField label="Total Weight (tons)" value={project.totalWeight} />
                <EntityViewField label="Mezzanine" value={formatDrawerBool(project.mezzanine)} />
                <EntityViewField label="Insulation" value={formatDrawerBool(project.insulation)} />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="progress">
            <EntityViewSection title="Progress Breakdown">
              <EntityViewFieldGrid>
                <EntityViewField label="Overall Progress" value={`${project.progress}%`} />
                <EntityViewField label="Design" value={`${project.designProgress}%`} />
                <EntityViewField label="Procurement" value={`${project.procurementProgress}%`} />
                <EntityViewField label="Fabrication" value={`${project.fabricationProgress}%`} />
                <EntityViewField label="Installation" value={`${project.installationProgress}%`} />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="references">
            <EntityViewSection title="Cross-Module References">
              <div className="flex flex-wrap gap-2">
                {project.customerId && (
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.customersDetail(project.customerId))}>
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    View Customer
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                {project.leadId && (
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.leadsDetail(project.leadId!))}>
                    View Lead
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                {project.estimateId && (
                  <Button variant="outline" size="sm" onClick={() => router.push(`${ROUTES.documentsEstimates}?ref=${project.estimateId}`)}>
                    View Estimate
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                {project.proposalId && (
                  <Button variant="outline" size="sm" onClick={() => router.push(`${ROUTES.documentsProposals}?ref=${project.proposalId}`)}>
                    View Proposal
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                {project.quotationId && (
                  <Button variant="outline" size="sm" onClick={() => router.push(`${ROUTES.documentsQuotations}?ref=${project.quotationId}`)}>
                    View Quotation
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                {project.invoiceIds && project.invoiceIds.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.finance)}>
                    View Finance ({project.invoiceIds.length})
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.projectsDetail(project.id))}>
                  Open Full Profile
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              </div>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="activity">
            <EntityViewSection title="Activity Timeline">
              <ProjectTimeline activities={activities} />
            </EntityViewSection>
          </EntityViewTabContent>
        </EntityViewTabs>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)}>
        {onEdit && <Button onClick={() => onEdit(project)}>Edit</Button>}
      </EntityViewFooter>
    </EntityViewDrawer>
  );
});
