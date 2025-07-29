import React, { useState, useEffect } from 'react';

interface StrategyEditModalProps {
  isOpen: boolean;
  strategyName: string;
  initialDescription: {
    overview: string;
    indicators: string;
    entryRules: string;
    advantages: string;
    disadvantages: string;
    bestConditions: string;
  };
  onSave: (description: any) => void;
  onClose: () => void;
}

export const StrategyEditModal: React.FC<StrategyEditModalProps> = ({
  isOpen,
  strategyName,
  initialDescription,
  onSave,
  onClose
}) => {
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(description);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    戦略を編集: {strategyName}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        概要
                      </label>
                      <textarea
                        value={description.overview}
                        onChange={(e) => setDescription({ ...description, overview: e.target.value })}
                        rows={3}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="この戦略の概要を説明してください"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        使用指標
                      </label>
                      <textarea
                        value={description.indicators}
                        onChange={(e) => setDescription({ ...description, indicators: e.target.value })}
                        rows={2}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="使用する指標（例：SMA, EMA, RSI）"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        エントリールール
                      </label>
                      <textarea
                        value={description.entryRules}
                        onChange={(e) => setDescription({ ...description, entryRules: e.target.value })}
                        rows={3}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="エントリー条件を詳しく記載"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        メリット
                      </label>
                      <textarea
                        value={description.advantages}
                        onChange={(e) => setDescription({ ...description, advantages: e.target.value })}
                        rows={2}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="この戦略のメリット"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        デメリット・リスク
                      </label>
                      <textarea
                        value={description.disadvantages}
                        onChange={(e) => setDescription({ ...description, disadvantages: e.target.value })}
                        rows={2}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="注意すべきリスクや弱点"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        最適な相場環境
                      </label>
                      <textarea
                        value={description.bestConditions}
                        onChange={(e) => setDescription({ ...description, bestConditions: e.target.value })}
                        rows={2}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="この戦略が機能する相場条件"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                保存
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};