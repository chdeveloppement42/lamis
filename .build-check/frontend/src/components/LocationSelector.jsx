import React, { useMemo } from 'react';
import Select from 'react-select';
import locationsData from '../data/algeria-locations.json';

const LocationSelector = ({ 
  wilaya, 
  commune, 
  onWilayaChange, 
  onCommuneChange,
  showCommune = true,
  required = true 
}) => {
  
  const wilayaOptions = useMemo(() => {
    return locationsData.map(w => ({
      value: w.nameFr,
      label: `${w.wilayaCode} - ${w.nameFr} (${w.nameAr})`,
      communes: w.communes
    }));
  }, []);

  const selectedWilayaObj = useMemo(() => {
    return wilayaOptions.find(opt => opt.value === wilaya);
  }, [wilaya, wilayaOptions]);

  const communeOptions = useMemo(() => {
    if (!selectedWilayaObj) return [];
    return selectedWilayaObj.communes.map(c => ({
      value: c.nameFr,
      label: `${c.nameFr} (${c.nameAr})`
    }));
  }, [selectedWilayaObj]);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '0px',
      border: 'none',
      borderBottom: state.isFocused ? '1px solid #D9B48F' : '1px solid rgba(255, 255, 255, 0.2)',
      padding: '4px 0',
      boxShadow: 'none',
      '&:hover': { borderBottom: '1px solid #D9B48F' }
    }),
    singleValue: (provided) => ({ ...provided, color: '#FFFFFF' }),
    placeholder: (provided) => ({ ...provided, color: 'rgba(255, 255, 255, 0.4)' }),
    input: (provided) => ({ ...provided, color: '#FFFFFF' }),
    menu: (provided) => ({
      ...provided,
      background: '#142836',
      border: '1px solid rgba(217, 180, 143, 0.3)',
      zIndex: 100
    }),
    option: (provided, state) => ({
      ...provided,
      background: state.isSelected ? '#D9B48F' : state.isFocused ? 'rgba(217, 180, 143, 0.1)' : 'transparent',
      color: state.isSelected ? '#142836' : state.isFocused ? '#D9B48F' : '#FFFFFF',
      cursor: 'pointer'
    }),
    dropdownIndicator: (provided) => ({ ...provided, color: '#D9B48F' }),
    indicatorSeparator: () => ({ display: 'none' })
  };

  return (
    <div className="location-selector">
      <div className="filter-group-luxe">
        <label>WILAYA {required && <span style={{ color: '#D9B48F' }}>*</span>}</label>
        <Select
          options={wilayaOptions}
          value={wilayaOptions.find(opt => opt.value === wilaya) || null}
          onChange={(opt) => {
            onWilayaChange(opt ? opt.value : '');
            if(onCommuneChange) onCommuneChange('');
          }}
          placeholder="Choisir une wilaya..."
          isSearchable
          isClearable
          styles={customStyles}
        />
      </div>

      {showCommune && (
        <div className="filter-group-luxe mt-3">
          <label>COMMUNE {required && <span style={{ color: '#D9B48F' }}>*</span>}</label>
          <Select
            options={communeOptions}
            value={communeOptions.find(opt => opt.value === commune) || null}
            onChange={(opt) => onCommuneChange(opt ? opt.value : '')}
            placeholder={wilaya ? "Choisir une commune..." : "D'abord une wilaya"}
            isDisabled={!wilaya}
            styles={customStyles}
          />
        </div>
      )}
    </div>
  );
};

export default LocationSelector;