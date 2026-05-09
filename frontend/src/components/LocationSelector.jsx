import React, { useMemo } from 'react';
import Select from 'react-select';
import locationsData from '../data/algeria-locations.json';

const LocationSelector = ({ 
  wilaya, 
  commune, 
  quartier, 
  onWilayaChange, 
  onCommuneChange, 
  onQuartierChange,
  error,
  required = true
}) => {
  // Format Wilayas for react-select
  const wilayaOptions = useMemo(() => {
    return locationsData.map(w => ({
      value: w.nameFr,
      label: `${w.wilayaCode} - ${w.nameFr} (${w.nameAr})`,
      communes: w.communes
    }));
  }, []);

  // Find current wilaya object to get its communes
  const selectedWilayaObj = useMemo(() => {
    return wilayaOptions.find(opt => opt.value === wilaya);
  }, [wilaya, wilayaOptions]);

  // Format Communes for the selected Wilaya
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
      borderRadius: '8px',
      borderColor: error ? '#ff4d4f' : provided.borderColor,
      padding: '2px',
      boxShadow: state.isFocused ? '0 0 0 1px #1d6fa4' : null,
      '&:hover': {
        borderColor: error ? '#ff4d4f' : '#1d6fa4'
      }
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      zIndex: 50
    })
  };

  return (
    <div className="location-selector" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-group">
        <label className="form-label">
          Wilaya {required && <span style={{ color: '#ff4d4f' }}>*</span>}
        </label>
        <Select
          options={wilayaOptions}
          value={wilayaOptions.find(opt => opt.value === wilaya) || null}
          onChange={(opt) => {
            onWilayaChange(opt ? opt.value : '');
            onCommuneChange(''); // Reset commune when wilaya changes
          }}
          placeholder="Sélectionnez une wilaya..."
          isSearchable
          isClearable
          styles={customStyles}
          classNamePrefix="select"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Commune {required && <span style={{ color: '#ff4d4f' }}>*</span>}
        </label>
        <Select
          options={communeOptions}
          value={communeOptions.find(opt => opt.value === commune) || null}
          onChange={(opt) => onCommuneChange(opt ? opt.value : '')}
          placeholder={wilaya ? "Sélectionnez une commune..." : "Sélectionnez d'abord une wilaya"}
          isSearchable
          isClearable
          isDisabled={!wilaya}
          styles={customStyles}
          classNamePrefix="select"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Quartier / Adresse <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.7 }}>(optionnel)</span></label>
        <input
          type="text"
          className="form-input"
          value={quartier || ''}
          onChange={(e) => onQuartierChange(e.target.value)}
          placeholder="Ex: Cité 100 logements, Rue..."
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
            outline: 'none'
          }}
        />
      </div>

      {error && <span style={{ color: '#ff4d4f', fontSize: '0.875rem' }}>{error}</span>}
    </div>
  );
};

export default LocationSelector;
