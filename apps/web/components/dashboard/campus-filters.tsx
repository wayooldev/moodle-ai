"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CampusCourse } from "@/lib/campus-types";

export type TaskStatusFilter = "all" | "upcoming" | "overdue";

type Props = {
  courses: CampusCourse[];
  courseFilter: string;
  onCourseFilter: (value: string) => void;
  statusFilter: TaskStatusFilter;
  onStatusFilter: (value: TaskStatusFilter) => void;
  query: string;
  onQuery: (value: string) => void;
  showStatusFilter?: boolean;
};

export function CampusFilters({
  courses,
  courseFilter,
  onCourseFilter,
  statusFilter,
  onStatusFilter,
  query,
  onQuery,
  showStatusFilter = true,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4">
      <div className="min-w-[160px] flex-1 space-y-1.5">
        <Label htmlFor="courseFilter">Curso</Label>
        <Select value={courseFilter} onValueChange={onCourseFilter}>
          <SelectTrigger id="courseFilter" aria-label="Filtrar por curso">
            <SelectValue placeholder="Todos los cursos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.fullname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {showStatusFilter ? (
        <div className="min-w-[140px] space-y-1.5">
          <Label htmlFor="statusFilter">Estado tareas</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => onStatusFilter(v as TaskStatusFilter)}
          >
            <SelectTrigger id="statusFilter" aria-label="Filtrar por estado">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="upcoming">Próximas</SelectItem>
              <SelectItem value="overdue">Vencidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <div className="min-w-[180px] flex-1 space-y-1.5">
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Filtrar por nombre"
        />
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          onCourseFilter("all");
          onStatusFilter("all");
          onQuery("");
        }}
      >
        Limpiar
      </Button>
    </div>
  );
}
