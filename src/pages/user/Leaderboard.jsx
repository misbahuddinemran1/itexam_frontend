import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'
import { Trophy, Medal, Loader2, Crown } from 'lucide-react'

export default function Leaderboard() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/v1/api/leaderboard?userId=${user.userId}`)
      .then(res => {
        setData(Array.isArray(res.data?.leaderboard) ? res.data.leaderboard : Array.isArray(res.data) ? res.data : [])
        setMyRank(res.data?.myRank || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const rankIcon = (rank) => {
    if (rank === 1) return <Crown size={18} className="text-amber-400" />
    if (rank === 2) return <Medal size={18} className="text-slate-400" />
    if (rank === 3) return <Medal size={18} className="text-amber-700" />
    return <span className="text-sm font-bold text-slate-400 w-[18px] text-center">#{rank}</span>
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={36} className="animate-spin text-primary-500" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30">
          <Trophy size={22} className="text-amber-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Leaderboard</h1>
          <p className="text-sm text-slate-400">শীর্ষ পরীক্ষার্থীরা</p>
        </div>
        {myRank && (
          <div className="ml-auto badge bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm px-3 py-1.5">
            আপনার র‍্যাংক: #{myRank}
          </div>
        )}
      </div>

      <div className="card">
        {data.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Trophy size={40} className="mx-auto mb-3 opacity-20" />
            <p>এখনো কোনো তথ্য নেই</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((entry, i) => {
              const rank = entry.rank || i + 1
              const isMe = entry.userId === user.userId
              return (
                <div key={i}
                  className={`flex items-center gap-3 p-3.5 rounded-xl transition-colors
                    ${isMe ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-300 dark:border-primary-700' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                  <div className="w-8 flex justify-center">{rankIcon(rank)}</div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(entry.userName || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isMe ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-200'}`}>
                      {entry.userName || 'অজ্ঞাত'} {isMe && <span className="text-xs">(আপনি)</span>}
                    </p>
                    <p className="text-xs text-slate-400">{entry.totalExams ?? 0} টি পরীক্ষা</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{entry.averageScore ?? entry.score ?? '—'}%</p>
                    <p className="text-xs text-slate-400">গড় স্কোর</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
