'use client';

import { ImpactFilterChips } from './ImpactFilterChips';
import { CountryMultiSelect } from './CountryMultiSelect';
import type { EventFilters } from '@/types/economic-calendar';
import type { EventImpact } from '@/lib/economic-calendar/types';

interface FilterBarProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const handleImpactToggle = (impact: EventImpact) => {
    const newImpacts = filters.impacts.includes(impact)
      ? filters.impacts.filter((i) => i !== impact)
      : [...filters.impacts, impact];
    
    onFiltersChange({ ...filters, impacts: newImpacts });
  };

  const handleCountriesChange = (countries: string[]) => {
    onFiltersChange({ ...filters, countries });
  };

  return (
    <div className="space-y-4">
      {/* Impact Filters */}
      <div>
        <label className="block text-sm font-semibold text-gray-400 mb-2">
          Impact Level
        </label>
        <ImpactFilterChips
          selectedImpacts={filters.impacts}
          onImpactToggle={handleImpactToggle}
        />
      </div>

      {/* Country Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-400 mb-2">
          Countries / Regions
        </label>
        <CountryMultiSelect
          selectedCountries={filters.countries}
          onCountriesChange={handleCountriesChange}
        />
      </div>
    </div>
  );
}
