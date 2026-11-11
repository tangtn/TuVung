import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Lock,
  Play,
  Users,
  BookOpen,
  Gamepad2,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RoadmapPage() {
  const { ROADMAPS, showToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(ROADMAPS[0].id);

  const currentRoadmap =
    ROADMAPS.find((r) => r.id === activeTab) || ROADMAPS[0];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Lộ trình học tập cá nhân hóa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Lộ Trình Chinh Phục TOEIC • IELTS • THPT
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Học theo từng chặng từ cơ bản đến nâng cao kết hợp thuật toán Spaced Repetition
          </p>
        </div>

        {/* Roadmap Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {ROADMAPS.map((rm) => (
            <button
              key={rm.id}
              onClick={() => setActiveTab(rm.id)}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition border ${
                activeTab === rm.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {rm.id === 'toeic'
                ? '🎯 Lộ trình TOEIC'
                : rm.id === 'ielts'
                ? '🎓 Lộ trình IELTS'
                : '🏫 Lộ trình THPTQG'}
            </button>
          ))}
        </div>
      </div>

      {/* Active Roadmap Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase">
              {currentRoadmap.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              {currentRoadmap.title}
            </h2>
            <p className="text-indigo-200 text-sm">{currentRoadmap.subtitle}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0 bg-white/10 p-4 rounded-2xl border border-white/10">
            <div>
              <p className="text-xs text-indigo-200">Học viên theo lộ trình</p>
              <p className="text-xl font-extrabold flex items-center gap-1.5 mt-0.5">
                <Users className="w-4 h-4 text-amber-300" />
                {currentRoadmap.learners.toLocaleString()}+
              </p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-xs text-indigo-200">Tổng từ vựng cốt lõi</p>
              <p className="text-xl font-extrabold flex items-center gap-1.5 mt-0.5">
                <BookOpen className="w-4 h-4 text-emerald-300" />
                {currentRoadmap.totalWords} từ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stages Timeline */}
      <div className="space-y-4">
        {currentRoadmap.stages.map((stage, index) => {
          const isLocked = stage.status === 'locked';
          const isCompleted = stage.status === 'completed';
          const isActive = stage.status === 'active';

          return (
            <div
              key={stage.id}
              className={`bg-white rounded-3xl p-6 border-2 transition shadow-xs ${
                isActive
                  ? 'border-indigo-500 ring-4 ring-indigo-500/10'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  {/* Step Number / Status Badge */}
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      `0${index + 1}`
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        Mục tiêu: {stage.targetScore}
                      </span>
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs">
                          🔥 Đang học chặng này
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-xs">
                          ✅ Đã hoàn thành
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900">
                      {stage.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">{stage.desc}</p>

                    {/* Stage Progress Bar */}
                    <div className="pt-2 max-w-md space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Tiến độ chặng</span>
                        <span className="text-indigo-600">{stage.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${stage.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {isLocked ? (
                    <button
                      onClick={() =>
                        showToast(
                          'Hãy hoàn thành chặng trước hoặc vào thẳng Kho bộ từ để học nhé!'
                        )
                      }
                      className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Mở khóa sau</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          navigate(
                            `/practice?deck=${stage.deckId}&mode=flashcard`
                          )
                        }
                        className="btn-3d px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Học SRS ngay</span>
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/practice?deck=${stage.deckId}&mode=quiz`)
                        }
                        className="btn-3d px-4 py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-extrabold text-xs flex items-center gap-1.5"
                      >
                        <Gamepad2 className="w-4 h-4" />
                        <span>Luyện Game</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
