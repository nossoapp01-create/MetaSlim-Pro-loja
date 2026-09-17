import React, { useState } from 'react';
import { X, Calculator, TestTube2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DosageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DosageCalculatorModal: React.FC<DosageCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [peptideMg, setPeptideMg] = useState<number>(10);
  const [waterMl, setWaterMl] = useState<number>(2.0);
  const [desiredDoseMg, setDesiredDoseMg] = useState<number>(2.5);

  if (!isOpen) return null;

  const concentration = waterMl > 0 ? peptideMg / waterMl : 0; // mg per ml
  const volumeNeededMl = concentration > 0 ? desiredDoseMg / concentration : 0;
  const syringeUnits100 = Math.round(volumeNeededMl * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-[#006750]">
            <Calculator className="w-5 h-5 text-[#006750]" />
            <h3 className="font-bold text-base text-slate-900">
              Calculadora de Reconstituição BAC
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Calcule o volume exato de diluição com Água Bacteriostática (BAC) e as unidades na seringa de insulina (U-100).
          </p>

          <div className="flex flex-col gap-3">
            {/* Peptídeo no Frasco */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Quantidade no Frasco (mg)</label>
              <div className="flex gap-2">
                {[5, 10, 15, 30].map((mg) => (
                  <button
                    key={mg}
                    type="button"
                    onClick={() => setPeptideMg(mg)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      peptideMg === mg
                        ? 'bg-[#006750] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {mg}mg
                  </button>
                ))}
              </div>
            </div>

            {/* Água Bacteriostática Adicionada */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Volume de Água BAC (ml)</label>
              <div className="flex gap-2">
                {[1.0, 2.0, 3.0].map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    onClick={() => setWaterMl(ml)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      waterMl === ml
                        ? 'bg-[#006750] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {ml.toFixed(1)}ml
                  </button>
                ))}
              </div>
            </div>

            {/* Dose Desejada */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                Dose Desejada por Aplicação (mg)
              </label>
              <input
                type="number"
                step="0.25"
                min="0.1"
                value={desiredDoseMg}
                onChange={(e) => setDesiredDoseMg(parseFloat(e.target.value) || 0)}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="p-4 rounded-xl bg-gradient-to-tr from-emerald-50 to-[#dffff0] border border-emerald-200 flex flex-col gap-2 mt-1">
            <span className="text-[11px] font-mono font-bold text-emerald-900 uppercase tracking-wider">
              Resultado Clínico
            </span>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600">Concentração da Solução:</span>
              <span className="font-mono text-xs font-bold text-slate-900">
                {concentration.toFixed(2)} mg/ml
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600">Volume por Dose:</span>
              <span className="font-mono text-xs font-bold text-slate-900">
                {volumeNeededMl.toFixed(2)} ml
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-200/80">
              <span className="text-xs font-bold text-[#006750]">
                Unidades na Seringa (U-100):
              </span>
              <span className="font-mono text-2xl font-extrabold text-[#006750]">
                {syringeUnits100} UI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Puxe a seringa até a marcação {syringeUnits100} para a dosagem calculada.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#006750] hover:bg-[#0d8267] text-white text-xs font-bold shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
