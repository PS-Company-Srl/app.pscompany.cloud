import { Head, Link, useForm } from '@inertiajs/react';
import CustomerLayout from '../../../Layouts/CustomerLayout';

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';
const labelClass = 'block text-sm font-medium text-slate-700';

export default function CustomerChatbotsCreate({ goalTypes }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    slug: '',
    goal_type: 'assistant',
    custom_goal: '',
  });

  return (
    <CustomerLayout>
      <Head title="Nuovo chatbot" />
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/chatbots" className="text-slate-600 hover:text-slate-900">
          ← Chatbot
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Nuovo chatbot</h1>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); post('/dashboard/chatbots'); }}
        className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <label htmlFor="name" className={labelClass}>Nome *</label>
          <input
            id="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            className={inputClass}
            placeholder="es. Assistente vendite"
          />
          {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>Slug (opzionale)</label>
          <input
            id="slug"
            value={data.slug}
            onChange={(e) => setData('slug', e.target.value)}
            className={inputClass}
            placeholder="es. vendite"
          />
          {errors.slug && <p className="mt-1.5 text-sm text-red-600">{errors.slug}</p>}
        </div>

        <div>
          <label htmlFor="goal_type" className={labelClass}>Obiettivo del chatbot</label>
          <select
            id="goal_type"
            value={data.goal_type}
            onChange={(e) => setData('goal_type', e.target.value)}
            className={inputClass}
          >
            {Object.entries(goalTypes || {}).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.goal_type && <p className="mt-1.5 text-sm text-red-600">{errors.goal_type}</p>}
        </div>

        {data.goal_type === 'custom' && (
          <div>
            <label htmlFor="custom_goal" className={labelClass}>Obiettivo personalizzato</label>
            <textarea
              id="custom_goal"
              value={data.custom_goal}
              onChange={(e) => setData('custom_goal', e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="Descrivi l'obiettivo che il chatbot deve perseguire..."
            />
            {errors.custom_goal && <p className="mt-1.5 text-sm text-red-600">{errors.custom_goal}</p>}
          </div>
        )}

        <div className="flex gap-3 border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={processing}
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            Crea chatbot
          </button>
          <Link
            href="/dashboard/chatbots"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annulla
          </Link>
        </div>
      </form>
    </CustomerLayout>
  );
}
